import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order detail",
  robots: { index: false, follow: false },
};

type OrderItemRow = {
  id: string;
  name_snapshot: string;
  sku_snapshot: string | null;
  qty: number;
  unit_price_paise: number;
};

type OrderDetailRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal_paise: number;
  shipping_paise: number;
  total_paise: number;
  created_at: string;
  tracking_url: string | null;
  awb_code: string | null;
  courier_name: string | null;
  shipping_status: string | null;
  address_snapshot: {
    name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | null;
  order_items: OrderItemRow[] | null;
};

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser(`/login?next=/account/orders/${id}`);

  if (!isSupabaseConfigured()) {
    notFound();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_status, payment_method, subtotal_paise, shipping_paise, total_paise, created_at, tracking_url, awb_code, courier_name, shipping_status, address_snapshot, order_items(id, name_snapshot, sku_snapshot, qty, unit_price_paise)",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const order = data as OrderDetailRow | null;
  if (!order) notFound();

  const address = order.address_snapshot;
  const items = order.order_items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/account/orders"
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Back to orders
        </Link>
        <h2 className="font-display mt-3 text-2xl font-semibold text-on-surface">
          {order.order_number}
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Placed {new Date(order.created_at).toLocaleString("en-IN")} ·{" "}
          <span className="capitalize">
            {order.status.replace(/_/g, " ")}
          </span>
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
            Payment
          </h3>
          <p className="mt-2 text-sm capitalize">
            {order.payment_method.replace(/_/g, " ")} ·{" "}
            {order.payment_status.replace(/_/g, " ")}
          </p>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-on-surface-variant">Subtotal</dt>
              <dd className="price font-semibold">
                {formatINR(order.subtotal_paise / 100)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-on-surface-variant">Shipping</dt>
              <dd className="price font-semibold">
                {formatINR(order.shipping_paise / 100)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-outline-variant/20 pt-2">
              <dt className="font-semibold">Total</dt>
              <dd className="price font-bold">
                {formatINR(order.total_paise / 100)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
            Tracking
          </h3>
          {order.tracking_url || order.awb_code || order.courier_name ? (
            <div className="mt-2 space-y-1 text-sm">
              {order.courier_name ? (
                <p>
                  <span className="text-on-surface-variant">Courier: </span>
                  {order.courier_name}
                </p>
              ) : null}
              {order.awb_code ? (
                <p>
                  <span className="text-on-surface-variant">AWB: </span>
                  {order.awb_code}
                </p>
              ) : null}
              {order.shipping_status ? (
                <p className="capitalize">
                  <span className="text-on-surface-variant">Status: </span>
                  {order.shipping_status.replace(/_/g, " ")}
                </p>
              ) : null}
              {order.tracking_url ? (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block font-semibold text-primary hover:underline"
                >
                  Track shipment
                </a>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-on-surface-variant">
              Tracking details will appear once your order ships.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
          Items
        </h3>
        <ul className="mt-3 divide-y divide-outline-variant/15">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <div>
                <p className="font-semibold">{item.name_snapshot}</p>
                <p className="text-xs text-on-surface-variant">
                  Qty {item.qty}
                  {item.sku_snapshot ? ` · ${item.sku_snapshot}` : ""}
                </p>
              </div>
              <p className="price font-semibold">
                {formatINR((item.unit_price_paise * item.qty) / 100)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {address ? (
        <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
            Delivery address
          </h3>
          <p className="mt-2 text-sm font-semibold">{address.name}</p>
          <p className="text-sm text-on-surface-variant">{address.phone}</p>
          <p className="mt-1 text-sm text-on-surface-variant">
            {[address.line1, address.line2].filter(Boolean).join(", ")}
            <br />
            {[address.city, address.state, address.pincode]
              .filter(Boolean)
              .join(", ")}
          </p>
        </section>
      ) : null}
    </div>
  );
}
