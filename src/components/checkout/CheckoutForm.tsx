"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart/use-cart";
import { formatINR } from "@/lib/format";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
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
        body: JSON.stringify({ ...payload, paymentMethod }),
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
        const rzp = new window.Razorpay({
          key: data.razorpay.keyId,
          amount: data.razorpay.amount,
          currency: data.razorpay.currency,
          order_id: data.razorpay.orderId,
          name: "Jai Jinendra Namkeens",
          handler: () => {
            router.push(
              `/account/orders?confirmed=${encodeURIComponent(data.order.orderNumber)}`,
            );
          },
        });
        rzp.open();
      } else {
        throw new Error("Razorpay not available");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
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
        <dl className="mt-4 space-y-2 border-t border-outline-variant/30 pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="price font-semibold">{formatINR(cart.subtotalPaise / 100)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd className="price font-semibold">
              {cart.shippingPaise === 0
                ? "FREE"
                : formatINR(cart.shippingPaise / 100)}
            </dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>Total</dt>
            <dd className="price">{formatINR(cart.totalPaise / 100)}</dd>
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
