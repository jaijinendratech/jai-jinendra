import type { EnquiryStatus, OrderStatus, PaymentStatus } from "@/types/database";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending_payment",
  "cod_confirmed",
  "confirmed",
  "dispatched",
  "delivered",
  "cancelled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending payment",
  cod_confirmed: "COD confirmed",
  confirmed: "Confirmed",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  in_progress: "In progress",
  closed: "Closed",
};

export function statusBadgeClass(kind: "order" | "payment" | "enquiry" | "stock", value: string) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide";
  if (kind === "stock") {
    if (value === "out") return `${base} bg-red-100 text-red-800`;
    if (value === "low") return `${base} bg-amber-100 text-amber-800`;
    return `${base} bg-emerald-100 text-emerald-800`;
  }
  if (kind === "payment") {
    if (value === "paid") return `${base} bg-emerald-100 text-emerald-800`;
    if (value === "failed" || value === "refunded") return `${base} bg-red-100 text-red-800`;
    return `${base} bg-amber-100 text-amber-800`;
  }
  if (kind === "enquiry") {
    if (value === "closed") return `${base} bg-zinc-100 text-zinc-700`;
    if (value === "in_progress") return `${base} bg-blue-100 text-blue-800`;
    return `${base} bg-amber-100 text-amber-800`;
  }
  // order
  if (value === "delivered") return `${base} bg-emerald-100 text-emerald-800`;
  if (value === "cancelled") return `${base} bg-red-100 text-red-800`;
  if (value === "dispatched") return `${base} bg-blue-100 text-blue-800`;
  if (value === "confirmed" || value === "cod_confirmed") return `${base} bg-violet-100 text-violet-800`;
  return `${base} bg-amber-100 text-amber-800`;
}
