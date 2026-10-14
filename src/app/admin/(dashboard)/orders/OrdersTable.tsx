"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatINR } from "@/lib/format";
import type { AdminOrderListItem } from "@/lib/admin/queries";
import {
  updateOrderPaymentStatusAction,
  updateOrderStatusAction,
} from "@/lib/admin/actions";
import { AdminTableShell, StatusBadge } from "@/components/admin/ui";
import { AdminStatusSelect } from "@/components/admin/AdminStatusSelect";
import { AdminTablePagination } from "@/components/admin/AdminTablePagination";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
} from "@/lib/admin/status";
import type { OrderStatus, PaymentStatus } from "@/types/database";

/** Rows arrive already filtered and paginated by the server (`?page=`). */
export function OrdersTable({
  orders,
  supabase,
  page,
  pageSize,
  total,
}: {
  orders: AdminOrderListItem[];
  supabase: boolean;
  page: number;
  pageSize: number;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function setPage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <>
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
                  {supabase ? (
                    <AdminStatusSelect
                      action={updateOrderPaymentStatusAction}
                      fields={{ orderId: order.dbId }}
                      value={order.paymentStatus}
                      kind="payment"
                      options={PAYMENT_STATUSES.map((s) => ({
                        value: s,
                        label: PAYMENT_STATUS_LABELS[s],
                      }))}
                    />
                  ) : (
                    <StatusBadge
                      kind="payment"
                      value={order.paymentStatus}
                      label={
                        PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus] ??
                        order.paymentStatus
                      }
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  {supabase ? (
                    <AdminStatusSelect
                      action={updateOrderStatusAction}
                      fields={{ orderId: order.dbId }}
                      value={order.status}
                      kind="order"
                      options={ORDER_STATUSES.map((s) => ({
                        value: s,
                        label: ORDER_STATUS_LABELS[s],
                      }))}
                    />
                  ) : (
                    <StatusBadge
                      kind="order"
                      value={order.status}
                      label={
                        ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status
                      }
                    />
                  )}
                </td>
                <td className="px-4 py-3 price font-semibold">{formatINR(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>
      <AdminTablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        from={from}
        to={to}
        onPageChange={setPage}
      />
      {!orders.length ? (
        <p className="text-center text-sm text-on-surface-variant">No orders match.</p>
      ) : null}
    </>
  );
}
