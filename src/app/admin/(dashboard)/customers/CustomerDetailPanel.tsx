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
  StatusBadge,
  adminFieldFullClassName,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import { AdminFormSubmitButton } from "@/components/admin/AdminIconButton";
import { AdminStatusSelect } from "@/components/admin/AdminStatusSelect";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
} from "@/lib/admin/status";
import type { OrderStatus, PaymentStatus } from "@/types/database";
import { isNextRedirectError } from "@/lib/admin/is-redirect-error";
import {
  AdminTablePagination,
  useAdminTablePagination,
} from "@/components/admin/AdminTablePagination";
import { isSyntheticPhoneEmail } from "@/lib/customers";

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
  const { pageItems, page, setPage, totalPages, total, from, to } =
    useAdminTablePagination(orders);
  const phoneAccount = isSyntheticPhoneEmail(customer.email);

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
          <AdminFieldGrid className="sm:grid-cols-1">
            <input type="hidden" name="id" value={customer.id} />
            {phoneAccount ? (
              <p
                className={`text-xs font-semibold uppercase tracking-wide text-on-surface-variant ${adminFieldFullClassName()}`}
              >
                <span className="inline-flex rounded-md bg-surface-container-high px-2 py-0.5 text-[11px] text-on-surface">
                  Phone account
                </span>
              </p>
            ) : null}
            <label className={`${labelClassName()} ${adminFieldFullClassName()}`}>
              Name
              <input
                name="fullName"
                defaultValue={customer.name === "—" ? "" : customer.name}
                className={fieldClassName()}
                disabled={!supabase}
                maxLength={120}
              />
            </label>
            <label className={`${labelClassName()} ${adminFieldFullClassName()}`}>
              {phoneAccount ? "Real email (optional)" : "Email"}
              <input
                name="email"
                type="email"
                defaultValue={phoneAccount ? "" : customer.email}
                placeholder={phoneAccount ? "customer@example.com" : undefined}
                className={fieldClassName()}
                disabled={!supabase}
              />
            </label>
            <label className={`${labelClassName()} ${adminFieldFullClassName()}`}>
              Phone{phoneAccount ? " (required)" : ""}
              <input
                name="phone"
                defaultValue={customer.phone}
                className={fieldClassName()}
                disabled={!supabase}
                required={phoneAccount}
                placeholder="+91 98765 43210"
              />
            </label>
            {error ? (
              <p
                className={`text-sm text-red-700 ${adminFieldFullClassName()}`}
                role="alert"
              >
                {error}
              </p>
            ) : null}
            {supabase ? (
              <div className={adminFieldFullClassName()}>
                <AdminFormSubmitButton
                  label="Save profile"
                  pendingLabel="Saving…"
                  icon="save"
                  variant="primary"
                />
              </div>
            ) : (
              <p
                className={`text-sm text-on-surface-variant ${adminFieldFullClassName()}`}
              >
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
          <>
            <ul className="divide-y divide-outline-variant/15">
              {pageItems.map((order) => (
                <li key={order.dbId} className="min-w-0 space-y-2 py-3 first:pt-0">
                  <div className="flex min-w-0 items-baseline justify-between gap-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="min-w-0 break-all font-semibold text-primary hover:underline"
                    >
                      {order.id}
                    </Link>
                    <span className="price shrink-0 font-semibold">
                      {formatINR(order.total)}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(order.placedAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {supabase ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <StatusBadge
                          kind="order"
                          value={order.status}
                          label={
                            ORDER_STATUS_LABELS[order.status as OrderStatus] ??
                            order.status
                          }
                        />
                        <StatusBadge
                          kind="payment"
                          value={order.paymentStatus}
                          label={
                            PAYMENT_STATUS_LABELS[
                              order.paymentStatus as PaymentStatus
                            ] ?? order.paymentStatus
                          }
                        />
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <AdminTablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              from={from}
              to={to}
              onPageChange={setPage}
            />
          </>
        )}
      </AdminCard>
    </div>
  );
}
