"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BrandSpinner } from "@/components/shared/BrandSpinner";
import { RequiredMark } from "@/components/shared/RequiredMark";
import { saveCheckoutAddressAction } from "@/lib/account/actions";
import { useCart } from "@/lib/cart/use-cart";
import { formatINR } from "@/lib/format";
import { calculateOrderTotals } from "@/lib/shipping";

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
];

export type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

type AddressFields = {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

function fieldsFromSaved(a: SavedAddress, email: string): AddressFields {
  return {
    name: a.name,
    phone: a.phone,
    email,
    line1: a.line1,
    line2: a.line2 ?? "",
    city: a.city,
    state: a.state,
    pincode: a.pincode,
  };
}

export function CheckoutForm({
  savedAddresses = [],
  defaultEmail = "",
}: {
  savedAddresses?: SavedAddress[];
  defaultEmail?: string;
}) {
  const router = useRouter();
  const { cart, loading } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">(
    "razorpay",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPaise: number;
  } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const initialSaved = savedAddresses[0] ?? null;
  // "new" = typing a fresh address; otherwise the id of the chosen saved one.
  const [addressChoice, setAddressChoice] = useState<string>(
    initialSaved?.id ?? "new",
  );
  const [fields, setFields] = useState<AddressFields>(
    initialSaved
      ? fieldsFromSaved(initialSaved, defaultEmail)
      : {
          name: "",
          phone: "",
          email: defaultEmail,
          line1: "",
          line2: "",
          city: "",
          state: INDIAN_STATES[0],
          pincode: "",
        },
  );
  const [saveAddress, setSaveAddress] = useState(true);

  function setField(name: keyof AddressFields, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function chooseAddress(id: string) {
    setAddressChoice(id);
    const saved = savedAddresses.find((a) => a.id === id);
    if (saved) {
      setFields((prev) => fieldsFromSaved(saved, prev.email || defaultEmail));
    } else {
      setFields((prev) => ({
        ...prev,
        name: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: INDIAN_STATES[0],
        pincode: "",
      }));
    }
  }

  const totals = useMemo(
    () =>
      calculateOrderTotals(
        cart.subtotalPaise,
        appliedCoupon?.discountPaise ?? 0,
        { prepaid: paymentMethod === "razorpay" },
      ),
    [cart.subtotalPaise, appliedCoupon?.discountPaise, paymentMethod],
  );

  async function applyCoupon() {
    setCouponBusy(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid coupon");
      setAppliedCoupon({
        code: data.code,
        discountPaise: data.discountPaise,
      });
      setCouponInput(data.code);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : "Invalid coupon");
    } finally {
      setCouponBusy(false);
    }
  }

  function clearCoupon() {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponInput("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const validateRes = await fetch("/api/checkout/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode: payload.pincode }),
      });
      if (!validateRes.ok) {
        const data = await validateRes.json();
        throw new Error(data.error ?? "Validation failed");
      }

      if (addressChoice === "new" && saveAddress) {
        // Best effort: a failed save must never block the order.
        void saveCheckoutAddressAction({
          name: fields.name,
          phone: fields.phone,
          line1: fields.line1,
          line2: fields.line2 || null,
          city: fields.city,
          state: fields.state,
          pincode: fields.pincode,
        }).catch(() => undefined);
      }

      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          paymentMethod,
          couponCode: appliedCoupon?.code ?? undefined,
        }),
      });
      const data = await orderRes.json();
      if (!orderRes.ok) throw new Error(data.error ?? "Order failed");

      if (paymentMethod === "cod") {
        router.push(
          `/account/orders?confirmed=${encodeURIComponent(data.order.orderNumber)}`,
        );
        return;
      }

      if (data.razorpay && window.Razorpay) {
        const orderNumber = data.order.orderNumber;

        const rzp = new window.Razorpay({
          key: data.razorpay.keyId,
          amount: data.razorpay.amount,
          currency: data.razorpay.currency,
          order_id: data.razorpay.orderId,
          name: "Jai Jinendra Namkeens",
          handler: async (response: RazorpaySuccessResponse) => {
            try {
              const verifyRes = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                throw new Error(verifyData.error ?? "Payment verification failed");
              }
              router.push(
                `/account/orders?confirmed=${encodeURIComponent(orderNumber)}`,
              );
            } catch (verifyErr) {
              setError(
                verifyErr instanceof Error
                  ? verifyErr.message
                  : "Payment verification failed",
              );
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              setError("Payment cancelled. Your order is saved, you can retry from your account.");
              setSubmitting(false);
            },
          },
        });

        rzp.on("payment.failed", (response) => {
          setError(
            response.error?.description ?? "Payment failed. Please try again.",
          );
          setSubmitting(false);
        });

        rzp.open();
      } else {
        throw new Error("Razorpay not available");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-on-surface-variant">Loading cart…</p>;
  }

  if (cart.items.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant">
        Your cart is empty.{" "}
        <Link href="/catalogue" className="text-primary hover:underline">
          Shop catalogue
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <h2 className="font-display text-lg font-semibold">Delivery address</h2>
          {savedAddresses.length > 0 ? (
            <div
              className="mt-4 space-y-2"
              role="radiogroup"
              aria-label="Saved addresses"
            >
              {savedAddresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                    addressChoice === a.id
                      ? "border-primary bg-primary/5"
                      : "border-outline-variant/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="saved_address"
                    className="mt-1"
                    checked={addressChoice === a.id}
                    onChange={() => chooseAddress(a.id)}
                  />
                  <span>
                    <span className="font-semibold">{a.name}</span>
                    {a.is_default ? (
                      <span className="ml-2 rounded-full bg-secondary/15 px-2 py-0.5 text-[11px] font-bold text-secondary">
                        Default
                      </span>
                    ) : null}
                    <span className="block text-on-surface-variant">
                      {[a.line1, a.line2, a.city, a.state]
                        .filter(Boolean)
                        .join(", ")}{" "}
                      - {a.pincode}
                    </span>
                    <span className="block text-on-surface-variant">
                      {a.phone}
                    </span>
                  </span>
                </label>
              ))}
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold ${
                  addressChoice === "new"
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant/30"
                }`}
              >
                <input
                  type="radio"
                  name="saved_address"
                  checked={addressChoice === "new"}
                  onChange={() => chooseAddress("new")}
                />
                Use a new address
              </label>
            </div>
          ) : null}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold sm:col-span-2">
              Full name
              <RequiredMark />
              <input name="name" value={fields.name} onChange={(e) => setField("name", e.target.value)} required className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="text-sm font-semibold">
              Phone
              <RequiredMark />
              <input name="phone" value={fields.phone} onChange={(e) => setField("phone", e.target.value)} required type="tel" className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="text-sm font-semibold">
              Email
              <RequiredMark />
              <input name="email" value={fields.email} onChange={(e) => setField("email", e.target.value)} required type="email" className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Address line 1
              <RequiredMark />
              <input name="line1" value={fields.line1} onChange={(e) => setField("line1", e.target.value)} required className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Address line 2 (optional)
              <input name="line2" value={fields.line2} onChange={(e) => setField("line2", e.target.value)} className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="text-sm font-semibold">
              City
              <RequiredMark />
              <input name="city" value={fields.city} onChange={(e) => setField("city", e.target.value)} required className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="text-sm font-semibold">
              State
              <RequiredMark />
              <select name="state" required value={fields.state} onChange={(e) => setField("state", e.target.value)} className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Pincode
              <RequiredMark />
              <input
                name="pincode" value={fields.pincode} onChange={(e) => setField("pincode", e.target.value)}
                required
                pattern="[1-9][0-9]{5}"
                className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
          </div>
          {addressChoice === "new" ? (
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
              />
              Save this address for next time
            </label>
          ) : null}
        </section>

        <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <h2 className="font-display text-lg font-semibold">Payment method</h2>
          <div className="mt-4 space-y-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant/30 px-4 py-3">
              <input
                type="radio"
                name="pm"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
              />
              <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                Pay online (UPI / Card / Netbanking)
                <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[11px] font-bold tracking-wide text-secondary">
                  ₹20 OFF
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer flex-col gap-1 rounded-lg border border-outline-variant/30 px-4 py-3">
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span className="text-sm font-semibold">Cash on delivery</span>
              </span>
            </label>
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-xl border border-outline-variant/30 bg-surface-container-low p-5 lg:col-span-5">
        <h2 className="font-display text-lg font-semibold">Order summary</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span>
                {item.productName} × {item.qty}
              </span>
              <span className="price font-semibold">
                {formatINR(item.lineTotalPaise / 100)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 border-t border-outline-variant/30 pt-4">
          <label className="text-sm font-semibold" htmlFor="coupon-code">
            Coupon code
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="coupon-code"
              data-testid="coupon-code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              disabled={Boolean(appliedCoupon) || couponBusy}
              placeholder="e.g. WELCOME10"
              className="min-w-0 flex-1 rounded-lg border border-outline-variant/50 px-3 py-2 text-sm uppercase focus:border-primary focus:outline-none disabled:opacity-60"
            />
            {appliedCoupon ? (
              <button
                type="button"
                data-testid="coupon-clear"
                onClick={clearCoupon}
                className="shrink-0 rounded-lg border border-outline-variant/40 px-3 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-lowest"
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                data-testid="coupon-apply"
                disabled={couponBusy || !couponInput.trim()}
                onClick={() => void applyCoupon()}
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {couponBusy ? <BrandSpinner size={16} label="Applying coupon" /> : "Apply"}
              </button>
            )}
          </div>
          {couponError ? (
            <p
              className="mt-2 text-xs text-error"
              role="alert"
              data-testid="coupon-error"
            >
              {couponError}
            </p>
          ) : null}
          {appliedCoupon ? (
            <p
              className="mt-2 text-xs font-semibold text-secondary"
              data-testid="coupon-applied"
            >
              {appliedCoupon.code} applied (−{formatINR(appliedCoupon.discountPaise / 100)})
            </p>
          ) : null}
        </div>

        <dl className="mt-4 space-y-2 border-t border-outline-variant/30 pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="price font-semibold">{formatINR(totals.subtotalPaise / 100)}</dd>
          </div>
          {totals.discountPaise > 0 ? (
            <div className="flex justify-between text-secondary">
              <dt>Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ""}</dt>
              <dd className="price font-semibold">
                −{formatINR(totals.discountPaise / 100)}
              </dd>
            </div>
          ) : null}
          {paymentMethod === "razorpay" && totals.prepaidDiscountPaise > 0 ? (
            <div className="flex justify-between text-secondary">
              <dt>Prepaid discount</dt>
              <dd className="price font-semibold">
                −{formatINR(totals.prepaidDiscountPaise / 100)}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd className="price font-semibold">
              {totals.shippingPaise === 0
                ? "FREE"
                : formatINR(totals.shippingPaise / 100)}
            </dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>Total</dt>
            <dd className="price">{formatINR(totals.totalPaise / 100)}</dd>
          </div>
        </dl>

        {error ? (
          <p className="mt-4 rounded-lg border border-error/30 bg-error-container/40 px-3 py-2 text-sm text-error">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-3 text-sm font-semibold text-white hover:bg-primary disabled:opacity-60"
        >
          {submitting ? (
            <>
              <BrandSpinner size={18} label="Placing order" />
              Processing…
            </>
          ) : (
            "Place order"
          )}
        </button>
      </aside>
    </form>
  );
}
