"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR } from "@/lib/format";
import type { AdminCustomer, AdminOrderListItem } from "@/lib/admin/queries";
import {
  updateCustomerProfileAction,
  updateOrderPaymentStatusAction,
  updateOrderStatusAction,
} from "@/lib/admin/actions";
import {
  AdminCard,
  AdminFieldGrid,
  AdminTableShell,
  StatusBadge,
  adminFieldFullClassName,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { AdminStatusSelect } from "@/components/admin/AdminStatusSelect";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
} from "@/lib/admin/status";
import type { OrderStatus, PaymentStatus } from "@/types/database";
import { isNextRedirectError } from "@/lib/admin/is-redirect-error";

export function CustomerDetailPanel({
  customer,
  orders,
  supabase,
  onSaved,
}: {
  customer: AdminCustomer;
  orders: AdminOrderListItem[];
  supabase: boolean;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <AdminCard title="Profile">
        <form
          action={async (formData) => {
            setError(null);
            try {
              await updateCustomerProfileAction(formData);
              router.refresh();
              onSaved?.();
            } catch (err) {
              if (isNextRedirectError(err)) throw err;
              setError(
                err instanceof Error ? err.message : "Could not save profile.",
              );
            }
          }}
        >
          <AdminFieldGrid>
            <input type="hidden" name="id" value={customer.id} />
            <label className={labelClassName()}>
              Name
              <input
                name="fullName"
                defaultValue={customer.name === "—" ? "" : customer.name}
                className={fieldClassName()}
                disabled={!supabase}
              />
            </label>
            <label className={labelClassName()}>
              Email
              <input
                name="email"
                type="email"
                defaultValue={customer.email}
                className={fieldClassName()}
                disabled={!supabase}
              />
            </label>
            <label className={`${labelClassName()} ${adminFieldFullClassName()}`}>
              Phone
              <input
                name="phone"
                defaultValue={customer.phone}
                className={fieldClassName()}
                disabled={!supabase}
              />
            </label>
            {error ? (
              <p className={`text-sm text-red-700 ${adminFieldFullClassName()}`} role="alert">
                {error}
              </p>
            ) : null}
            {supabase ? (
              <div className={adminFieldFullClassName()}>
                <AdminIconButton
                  type="submit"
                  label="Save profile"
                  icon="save"
                  variant="primary"
                  showLabel
                />
              </div>
            ) : (
              <p className={`text-sm text-on-surface-variant ${adminFieldFullClassName()}`}>
                Connect Supabase to edit this profile.
              </p>
            )}
          </AdminFieldGrid>
        </form>
      </AdminCard>

      <AdminCard title="Order history">
        {!orders.length ? (
          <p className="text-sm text-on-surface-variant">
            No orders for this customer.
          </p>
        ) : (
          <AdminTableShell>
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-outline-variant/20 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {orders.map((order) => (
                  <tr
                    key={order.dbId}
                    className="hover:bg-surface-container-low/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {new Date(order.placedAt).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 price font-semibold">
                      {formatINR(order.total)}
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
                            ORDER_STATUS_LABELS[order.status as OrderStatus] ??
                            order.status
                          }
                        />
                      )}
                    </td>
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
                            PAYMENT_STATUS_LABELS[
                              order.paymentStatus as PaymentStatus
                            ] ?? order.paymentStatus
                          }
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableShell>
        )}
      </AdminCard>
    </div>
  );
}
