import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/format";
import { getAdminOrderById, getIntegrationStatus } from "@/lib/admin/queries";
import {
  updateOrderPaymentStatusAction,
  updateOrderShippingAction,
  updateOrderStatusAction,
} from "@/lib/admin/actions";
import {
  AdminCard,
  AdminPageHeader,
  StatusBadge,
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

export const metadata: Metadata = {
  title: "Admin · Order detail",
  robots: { index: false, follow: false },
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();
  const { supabase } = getIntegrationStatus();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={order.orderNumber}
        description={`Placed ${new Date(order.placedAt).toLocaleString("en-IN")}`}
        actions={
          <Link href="/admin/orders" className="text-sm font-semibold text-primary hover:underline">
            Back to orders
          </Link>
        }
      />

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
              label={ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
            />
            <StatusBadge
              kind="payment"
              value={order.paymentStatus}
              label={
                PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus] ??
                order.paymentStatus
              }
            />
          </>
        )}
      </div>

      <AdminCard title="Customer & shipping address">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-on-surface-variant">Name</dt>
            <dd className="font-semibold">{order.customer}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Phone</dt>
            <dd className="font-semibold">{order.phone || order.address.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Email</dt>
            <dd className="font-semibold">{order.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Pincode</dt>
            <dd className="font-semibold">{order.address.pincode || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-on-surface-variant">Address line 1</dt>
            <dd className="font-semibold">{order.address.line1 || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-on-surface-variant">Address line 2</dt>
            <dd className="font-semibold">{order.address.line2 || "—"}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">City</dt>
            <dd className="font-semibold">{order.address.city || order.city || "—"}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">State</dt>
            <dd className="font-semibold">{order.address.state || "—"}</dd>
          </div>
        </dl>
        {order.notes ? (
          <p className="mt-4 rounded-lg bg-surface-container-low p-3 text-sm text-on-surface-variant">
            Notes: {order.notes}
          </p>
        ) : null}
      </AdminCard>

      <AdminCard title="Payment (non-secret IDs)">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-on-surface-variant">Method</dt>
            <dd className="font-semibold capitalize">{order.paymentMethod}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Razorpay order</dt>
            <dd className="break-all font-mono text-xs">{order.razorpayOrderId || "—"}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Razorpay payment</dt>
            <dd className="break-all font-mono text-xs">{order.razorpayPaymentId || "—"}</dd>
          </div>
        </dl>
      </AdminCard>

      <AdminCard title="Line items">
        <ul className="divide-y divide-outline-variant/15">
          {order.items.map((item) => (
            <li key={`${item.name}-${item.sku ?? ""}`} className="flex justify-between py-3 text-sm">
              <span>
                {item.name}{" "}
                <span className="text-on-surface-variant">× {item.qty}</span>
                {item.sku ? (
                  <span className="ml-2 text-[11px] text-outline">{item.sku}</span>
                ) : null}
              </span>
              <span className="price font-semibold">
                {formatINR(item.unitPrice * item.qty)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-outline-variant/20 pt-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="price">{formatINR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="price">{formatINR(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="price text-lg text-primary">{formatINR(order.total)}</span>
          </div>
        </div>
      </AdminCard>

      {supabase ? (
        <AdminCard title="Shipping (manual / Shiprocket fields)">
            <p className="mb-4 text-xs text-on-surface-variant">
              Shiprocket API is not wired yet — enter courier/AWB manually when known.
            </p>
            <form action={updateOrderShippingAction} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="orderId" value={order.dbId} />
              <label className={labelClassName()}>
                Courier
                <input
                  name="courierName"
                  defaultValue={order.courierName ?? ""}
                  className={fieldClassName()}
                />
              </label>
              <label className={labelClassName()}>
                AWB / tracking code
                <input name="awbCode" defaultValue={order.awbCode ?? ""} className={fieldClassName()} />
              </label>
              <label className={labelClassName()}>
                Shipment ID
                <input
                  name="shipmentId"
                  defaultValue={order.shipmentId ?? ""}
                  className={fieldClassName()}
                />
              </label>
              <label className={labelClassName()}>
                Shipping status
                <input
                  name="shippingStatus"
                  defaultValue={order.shippingStatus ?? ""}
                  className={fieldClassName()}
                />
              </label>
              <label className={`${labelClassName()} sm:col-span-2`}>
                Tracking URL
                <input
                  name="trackingUrl"
                  defaultValue={order.trackingUrl ?? ""}
                  className={fieldClassName()}
                />
              </label>
              <AdminIconButton
                type="submit"
                label="Save shipping"
                icon="save"
                variant="primary"
              />
            </form>
          </AdminCard>
      ) : (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Connect Supabase to update order status and shipping fields.
        </p>
      )}
    </div>
  );
}
