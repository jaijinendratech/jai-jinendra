"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { trackOrderMeta } from "@/data/customer-care";
import { formatINR } from "@/lib/format";

type TrackResult = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalPaise: number;
  createdAt: string;
};

export function TrackOrderForm() {
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = new URLSearchParams({
        orderNumber: orderId.trim(),
        phone: contact.trim(),
      });
      const res = await fetch(`/api/orders/track?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order not found");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Track Order" },
        ]}
      />

      <div className="mx-auto max-w-xl">
        <p className="label-sm uppercase tracking-widest text-primary">
          Customer Care
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
          {trackOrderMeta.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant md:text-base">
          {trackOrderMeta.description}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
        >
          <div>
            <label
              htmlFor="orderId"
              className="label-md mb-1.5 block font-semibold text-on-surface"
            >
              Order number
            </label>
            <input
              id="orderId"
              name="orderId"
              type="text"
              required
              autoComplete="off"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="e.g. JJ-10428"
              className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="contact"
              className="label-md mb-1.5 block font-semibold text-on-surface"
            >
              Registered phone
            </label>
            <input
              id="contact"
              name="contact"
              type="tel"
              required
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="10-digit mobile used at checkout"
              className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-3 text-sm font-semibold text-white transition hover:bg-primary disabled:opacity-60"
          >
            <Search className="h-4 w-4" aria-hidden />
            {loading ? "Looking up…" : "Track shipment"}
          </button>

          {error ? (
            <p role="alert" className="rounded-lg border border-error/30 bg-error-container/40 px-3 py-2 text-sm text-error">
              {error}
            </p>
          ) : null}

          {result ? (
            <div
              role="status"
              className="rounded-lg border border-secondary/30 bg-secondary-container/30 px-4 py-3 text-sm"
            >
              <p className="font-semibold">{result.orderNumber}</p>
              <p className="mt-1 capitalize text-on-surface-variant">
                Status: {result.status.replace(/_/g, " ")} · Payment: {result.paymentStatus}
              </p>
              <p className="mt-1 price font-bold">{formatINR(result.totalPaise / 100)}</p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Placed {new Date(result.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
          ) : null}
        </form>
      </div>
    </main>
  );
}
