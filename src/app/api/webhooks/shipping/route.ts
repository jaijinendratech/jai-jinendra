import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { logPaymentEvent } from "@/lib/observability/log";
import type { OrderStatus } from "@/types/database";
import {
  mapShiprocketToOrderStatus,
  shippingStatusLabel,
  shouldAdvanceOrderStatus,
  webhookEventId,
  type ShippingWebhookPayload,
} from "@/lib/shipping/shiprocket-webhook";

export const runtime = "nodejs";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function authorize(request: Request): boolean {
  const expected = process.env.SHIPPING_WEBHOOK_SECRET?.trim();
  if (!expected) return false;
  const provided =
    request.headers.get("x-api-key")?.trim() ||
    request.headers.get("X-Api-Key")?.trim() ||
    "";
  return provided.length > 0 && timingSafeEqual(provided, expected);
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: ShippingWebhookPayload = {};
  try {
    const text = await request.text();
    if (text.trim()) {
      payload = JSON.parse(text) as ShippingWebhookPayload;
    }
  } catch {
    // Shiprocket "Test Webhook" may send empty / non-JSON — still ack 200 after auth.
    return NextResponse.json({ received: true, test: true });
  }

  const awb = payload.awb != null ? String(payload.awb).trim() : "";
  if (!awb) {
    // Auth OK but no AWB (connection test) — acknowledge so dashboard Save works.
    return NextResponse.json({ received: true, unmatched: true });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ received: true, skipped: "no_db" });
  }

  try {
    const admin = createAdminClient();
    const eventId = webhookEventId(payload);
    const { error: dedupeErr } = await admin.from("webhook_events").insert({
      id: eventId,
      provider: "shipping",
      event_type: shippingStatusLabel(payload),
    });
    if (dedupeErr?.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const { data: order } = await admin
      .from("orders")
      .select("id, status, awb_code, shipment_id")
      .eq("awb_code", awb)
      .maybeSingle();

    if (!order) {
      logPaymentEvent("shipping_webhook_unmatched", { awb });
      return NextResponse.json({ received: true, unmatched: true });
    }

    const shippingStatus = shippingStatusLabel(payload);
    const mapped = mapShiprocketToOrderStatus(payload);
    const patch: {
      shipping_status: string;
      courier_name?: string | null;
      status?: OrderStatus;
      updated_at: string;
    } = {
      shipping_status: shippingStatus,
      updated_at: new Date().toISOString(),
    };

    if (payload.courier_name?.trim()) {
      patch.courier_name = payload.courier_name.trim().slice(0, 120);
    }

    const currentStatus = order.status as OrderStatus;
    if (mapped && shouldAdvanceOrderStatus(currentStatus, mapped)) {
      patch.status = mapped;
    }

    const { error: updateErr } = await admin
      .from("orders")
      .update(patch)
      .eq("id", order.id);

    if (updateErr) {
      logPaymentEvent("shipping_webhook_update_error", {
        awb,
        error: updateErr.message,
      });
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    logPaymentEvent("shipping_webhook_applied", {
      awb,
      shipping_status: shippingStatus,
      order_status: patch.status ?? currentStatus,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    logPaymentEvent("shipping_webhook_error", {
      error: err instanceof Error ? err.message : "unknown",
    });
    // Prefer 200 for auth-ok noise only; real failures keep 500 so Shiprocket retries.
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
