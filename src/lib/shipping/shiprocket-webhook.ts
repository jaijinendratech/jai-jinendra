import type { OrderStatus } from "@/types/database";

/** Shiprocket tracking webhook body (subset we use). */
export type ShippingWebhookPayload = {
  awb?: string | number | null;
  courier_name?: string | null;
  current_status?: string | null;
  current_status_id?: number | string | null;
  shipment_status?: string | null;
  shipment_status_id?: number | string | null;
  current_timestamp?: string | null;
  order_id?: string | number | null;
  sr_order_id?: string | number | null;
  etd?: string | null;
};

const ORDER_RANK: Record<OrderStatus, number> = {
  pending_payment: 0,
  cod_confirmed: 1,
  confirmed: 2,
  dispatched: 3,
  delivered: 4,
  cancelled: 5,
};

function norm(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ");
}

/**
 * Map Shiprocket status labels / ids → our order.status (when we should advance).
 * Returns null to leave order.status unchanged (only update shipping_status).
 */
export function mapShiprocketToOrderStatus(
  payload: ShippingWebhookPayload,
): OrderStatus | null {
  const label = `${norm(payload.current_status)} ${norm(payload.shipment_status)}`;
  const id = Number(payload.current_status_id ?? payload.shipment_status_id);

  // Common Shiprocket status ids (may vary; label keywords are the safety net)
  if (id === 7 || /\bdelivered\b/.test(label)) return "delivered";
  if (
    id === 9 ||
    id === 10 ||
    /\brto\b/.test(label) ||
    /\bcancel/.test(label) ||
    /\blost\b/.test(label) ||
    /\bdestroyed\b/.test(label)
  ) {
    return "cancelled";
  }
  if (
    id === 6 ||
    id === 17 ||
    id === 18 ||
    id === 19 ||
    id === 20 ||
    id === 38 ||
    id === 42 ||
    /\bpicked\b/.test(label) ||
    /\bin transit\b/.test(label) ||
    /\bout for delivery\b/.test(label) ||
    /\bshipped\b/.test(label) ||
    /\bmanifest\b/.test(label) ||
    /\bdispatched\b/.test(label)
  ) {
    return "dispatched";
  }

  return null;
}

export function shippingStatusLabel(payload: ShippingWebhookPayload): string {
  const raw =
    payload.current_status?.trim() ||
    payload.shipment_status?.trim() ||
    "updated";
  return raw.slice(0, 120);
}

export function shouldAdvanceOrderStatus(
  current: OrderStatus,
  next: OrderStatus,
): boolean {
  if (current === "cancelled" || current === "delivered") return false;
  if (next === "cancelled") return true;
  return ORDER_RANK[next] >= ORDER_RANK[current];
}

export function webhookEventId(payload: ShippingWebhookPayload): string {
  const awb = String(payload.awb ?? "no-awb");
  const status =
    payload.current_status_id ??
    payload.shipment_status_id ??
    payload.current_status ??
    "unknown";
  const ts = payload.current_timestamp ?? "nots";
  return `shipping:${awb}:${status}:${ts}`.slice(0, 200);
}
