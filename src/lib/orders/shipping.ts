import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import {
  assignAwb,
  createShiprocketShipment,
  generateLabel,
  generateManifest,
  generatePickup,
  isShiprocketConfigured,
} from "@/lib/shiprocket";

const DEFAULT_WEIGHT_KG = 0.5;
/** Packaging allowance added on top of the products' own weight. */
const PACKAGING_KG = 0.1;

export type EnsureShipmentResult =
  | { ok: true; created: boolean; reason?: string }
  | { ok: false; error: string };

type OrderShipRow = {
  id: string;
  order_number: string;
  created_at: string;
  payment_method: string;
  subtotal_paise: number;
  discount_paise: number;
  prepaid_discount_paise: number;
  customer_phone: string | null;
  customer_email: string | null;
  shipment_id: string | null;
  awb_code: string | null;
  address_snapshot: Record<string, string | undefined> | null;
  order_items:
    | {
        name_snapshot: string;
        sku_snapshot: string | null;
        qty: number;
        unit_price_paise: number;
        product_variants: { weight_g: number | null } | null;
      }[]
    | null;
};

/** Parcel weight in kg from the ordered variants; falls back to a default when unknown. */
export function parcelWeightKg(
  items: { qty: number; weightG: number | null }[],
): number {
  const grams = items.reduce((sum, i) => sum + i.qty * (i.weightG ?? 0), 0);
  if (grams <= 0) return DEFAULT_WEIGHT_KG;
  return Math.round((grams / 1000 + PACKAGING_KG) * 100) / 100;
}

/**
 * Create the Shiprocket shipment for an order, once.
 *
 * Never throws: failures are stored on the order (`shipping_error`) so order
 * placement and payment confirmation are never blocked by Shiprocket. Safe to
 * call from several paths at once (verify-payment + webhook): the order is
 * claimed atomically before any API call.
 *
 * `markDispatched` is a legacy escape hatch; normal flow is auto-create here,
 * then an admin marks the order ready to ship (see `markReadyToShip`), and the
 * Shiprocket webhook moves it to dispatched once the courier collects it.
 */
export async function ensureShiprocketShipment(
  orderId: string,
  options: { markDispatched?: boolean } = {},
): Promise<EnsureShipmentResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is required for Shiprocket." };
  }
  if (!isShiprocketConfigured()) {
    return {
      ok: false,
      error:
        "Shiprocket is not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD.",
    };
  }

  const admin = createAdminClient();

  // Atomic claim: only one caller gets a row back.
  const { data: claimed } = await admin
    .from("orders")
    .update({ shipping_status: "creating", shipping_error: null })
    .eq("id", orderId)
    .is("shipment_id", null)
    .is("awb_code", null)
    .or("shipping_status.is.null,shipping_status.neq.creating")
    .select("id")
    .maybeSingle();

  if (!claimed) {
    return { ok: true, created: false, reason: "already created or in progress" };
  }

  const fail = async (message: string): Promise<EnsureShipmentResult> => {
    console.error(`[shiprocket] order ${orderId}: ${message}`);
    await admin
      .from("orders")
      .update({ shipping_status: null, shipping_error: message.slice(0, 500) })
      .eq("id", orderId);
    return { ok: false, error: message };
  };

  try {
    const { data, error } = await admin
      .from("orders")
      .select("*, order_items(*, product_variants(weight_g))")
      .eq("id", orderId)
      .maybeSingle();
    if (error || !data) return await fail("Order not found.");

    const row = data as unknown as OrderShipRow;
    const addr = row.address_snapshot ?? {};
    const orderItems = row.order_items ?? [];

    const result = await createShiprocketShipment({
      orderNumber: row.order_number,
      orderDate: row.created_at,
      paymentMethod: row.payment_method,
      subtotalRupees: row.subtotal_paise / 100,
      couponDiscountRupees: (row.discount_paise ?? 0) / 100,
      prepaidDiscountRupees: (row.prepaid_discount_paise ?? 0) / 100,
      address: {
        name: addr.name || "Customer",
        phone: row.customer_phone || addr.phone || "",
        email: row.customer_email || addr.email,
        line1: addr.line1 || "",
        line2: addr.line2,
        city: addr.city || "",
        state: addr.state || "",
        pincode: addr.pincode || "",
      },
      items: orderItems.map((item) => ({
        name: item.name_snapshot,
        sku: item.sku_snapshot || "ITEM",
        units: item.qty,
        sellingPriceRupees: item.unit_price_paise / 100,
      })),
      weightKg: parcelWeightKg(
        orderItems.map((item) => ({
          qty: item.qty,
          weightG: item.product_variants?.weight_g ?? null,
        })),
      ),
    });

    await admin
      .from("orders")
      .update({
        shipment_id: result.shipmentId,
        awb_code: result.awbCode,
        courier_name: result.courierName,
        tracking_url: result.trackingUrl,
        shipping_status: result.shippingStatus,
        shipping_error: null,
      })
      .eq("id", orderId);

    if (options.markDispatched) {
      await admin
        .from("orders")
        .update({ status: "dispatched" })
        .eq("id", orderId)
        .not("status", "in", "(pending_payment,cancelled)");
    }

    return { ok: true, created: true };
  } catch (err) {
    return await fail(
      err instanceof Error ? err.message : "Shiprocket shipment failed.",
    );
  }
}

export type ReadyToShipResult =
  | { ok: true; alreadyScheduled?: boolean }
  | { ok: false; error: string };

/**
 * Admin says the parcel is packed: make sure a Shiprocket shipment + AWB exist,
 * then request the courier pickup. Idempotent, and failures are stored in
 * `pickup_error` (order status is left unchanged) so the admin can retry.
 */
export async function markReadyToShip(
  orderId: string,
): Promise<ReadyToShipResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is required for Shiprocket." };
  }
  if (!isShiprocketConfigured()) {
    return {
      ok: false,
      error:
        "Shiprocket is not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD.",
    };
  }

  const admin = createAdminClient();
  const readOrder = () =>
    admin
      .from("orders")
      .select("id, status, shipment_id, awb_code, pickup_scheduled_at, pickup_token")
      .eq("id", orderId)
      .maybeSingle();

  let { data: order } = await readOrder();
  if (!order) return { ok: false, error: "Order not found." };

  if (order.status === "ready_to_ship" && order.pickup_scheduled_at) {
    return { ok: true, alreadyScheduled: true };
  }
  if (order.status !== "confirmed" && order.status !== "cod_confirmed" && order.status !== "ready_to_ship") {
    return {
      ok: false,
      error: `Only confirmed orders can be marked ready to ship (this one is "${order.status}").`,
    };
  }

  const fail = async (message: string): Promise<ReadyToShipResult> => {
    console.error(`[shiprocket] ready-to-ship ${orderId}: ${message}`);
    await admin
      .from("orders")
      .update({ pickup_error: message.slice(0, 500) })
      .eq("id", orderId);
    return { ok: false, error: message };
  };

  try {
    if (!order.shipment_id) {
      const created = await ensureShiprocketShipment(orderId);
      if (!created.ok) return await fail(created.error);
      ({ data: order } = await readOrder());
      if (!order?.shipment_id) {
        return await fail("Shiprocket shipment is still being created, try again in a moment.");
      }
    }

    let awbCode = order.awb_code;
    if (!awbCode) {
      const assigned = await assignAwb(order.shipment_id);
      awbCode = assigned.awbCode;
      await admin
        .from("orders")
        .update({
          awb_code: assigned.awbCode,
          courier_name: assigned.courierName,
          tracking_url: `https://shiprocket.co/tracking/${assigned.awbCode}`,
          shipping_status: "awb_assigned",
          shipping_error: null,
        })
        .eq("id", orderId);
    }

    const pickup = await generatePickup(order.shipment_id);

    // Label / manifest are conveniences: never fail the pickup over them.
    const [labelUrl, manifestUrl] = await Promise.all([
      generateLabel(order.shipment_id).catch(() => null),
      generateManifest(order.shipment_id).catch(() => null),
    ]);

    await admin
      .from("orders")
      .update({
        status: "ready_to_ship",
        pickup_scheduled_at: pickup.scheduledAt
          ? new Date(pickup.scheduledAt).toISOString()
          : new Date().toISOString(),
        pickup_token: pickup.token,
        pickup_error: null,
        label_url: labelUrl,
        manifest_url: manifestUrl,
        shipping_status: "pickup_scheduled",
      })
      .eq("id", orderId);

    return { ok: true };
  } catch (err) {
    return await fail(
      err instanceof Error ? err.message : "Could not request the pickup.",
    );
  }
}
