"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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

export function CheckoutForm() {
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

  const totals = useMemo(
    () =>
      calculateOrderTotals(cart.subtotalPaise, appliedCoupon?.discountPaise ?? 0),
    [cart.subtotalPaise, appliedCoupon?.discountPaise],
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
              setError("Payment cancelled. Your order is saved — you can retry from your account.");
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
        <a href="/catalogue" className="text-primary hover:underline">
          Shop catalogue
        </a>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <h2 className="font-display text-lg font-semibold">Delivery address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold sm:col-span-2">
              Full name
              <input name="name" required className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="text-sm font-semibold">
              Phone
              <input name="phone" required type="tel" className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="text-sm font-semibold">
              Email
              <input name="email" required type="email" className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Address line 1
              <input name="line1" required className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Address line 2 (optional)
              <input name="line2" className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="text-sm font-semibold">
              City
              <input name="city" required className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="text-sm font-semibold">
              State
              <select name="state" required className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Pincode
              <input
                name="pincode"
                required
                pattern="[1-9][0-9]{5}"
                className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
          </div>
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
              <span className="text-sm font-semibold">Pay online (UPI / Card / Netbanking)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant/30 px-4 py-3">
              <input
                type="radio"
                name="pm"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <span className="text-sm font-semibold">Cash on delivery</span>
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
                className="shrink-0 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {couponBusy ? "…" : "Apply"}
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
          className="mt-5 w-full rounded-lg bg-primary-container py-3 text-sm font-semibold text-white hover:bg-primary disabled:opacity-60"
        >
          {submitting ? "Processing…" : "Place order"}
        </button>
      </aside>
    </form>
  );
}
