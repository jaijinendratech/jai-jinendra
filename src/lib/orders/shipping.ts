import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import {
  createShiprocketShipment,
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
 * `markDispatched` is only for the admin button, auto-creation leaves the
 * order status alone because nothing has been dispatched yet.
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
