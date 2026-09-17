import type { Metadata } from "next";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import { getAdminOrders, getIntegrationStatus } from "@/lib/admin/queries";
import {
  AdminPageHeader,
  AdminTableShell,
  StatusBadge,
} from "@/components/admin/ui";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/admin/status";
import type { OrderStatus, PaymentStatus } from "@/types/database";
import { OrdersFilters } from "./OrdersFilters";

export const metadata: Metadata = {
  title: "Admin · Orders",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string }>;
}) {
  const params = await searchParams;
  const all = await getAdminOrders();
  const { supabase } = getIntegrationStatus();

  const q = (params.q ?? "").toLowerCase();
  const orders = all.filter((o) => {
    if (params.status && params.status !== "all" && o.status !== params.status) return false;
    if (params.payment && params.payment !== "all" && o.paymentStatus !== params.payment)
      return false;
    if (!q) return true;
    return `${o.id} ${o.customer} ${o.email} ${o.city}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description={
          supabase
            ? "Live orders from Supabase."
            : "Sample orders (mock) — connect Supabase for live data."
        }
      />

      <OrdersFilters
        q={params.q ?? ""}
        status={params.status ?? "all"}
        payment={params.payment ?? "all"}
      />

      <AdminTableShell>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-outline-variant/20 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">City</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {orders.map((order) => (
              <tr key={order.dbId} className="hover:bg-surface-container-low/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {order.id}
                  </Link>
                  <p className="text-[11px] text-on-surface-variant">
                    {new Date(order.placedAt).toLocaleString("en-IN")}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p>{order.customer}</p>
                  <p className="text-xs text-on-surface-variant">{order.email}</p>
                </td>
                <td className="px-4 py-3">{order.city}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    kind="payment"
                    value={order.paymentStatus}
                    label={
                      PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus] ??
                      order.paymentStatus
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    kind="order"
                    value={order.status}
                    label={
                      ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status
                    }
                  />
                </td>
                <td className="px-4 py-3 price font-semibold">{formatINR(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>
      {!orders.length ? (
        <p className="text-center text-sm text-on-surface-variant">No orders match.</p>
      ) : null}
    </div>
  );
}
