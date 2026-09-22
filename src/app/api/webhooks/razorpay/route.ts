import { NextResponse } from "next/server";
import { handleRazorpayPaymentSuccess } from "@/lib/orders/create-order";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { logPaymentEvent } from "@/lib/observability/log";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  try {
    if (!verifyRazorpayWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body) as {
      event: string;
      id?: string;
      payload: {
        payment?: { entity: { order_id: string; id: string } };
      };
    };

    const eventId =
      payload.id ||
      `${payload.event}:${payload.payload.payment?.entity?.id ?? "unknown"}`;

    if (isSupabaseConfigured()) {
      const admin = createAdminClient();
      const { error: dedupeErr } = await admin.from("webhook_events").insert({
        id: eventId,
        provider: "razorpay",
        event_type: payload.event,
      });
      // Unique violation → already processed
      if (dedupeErr?.code === "23505") {
        return NextResponse.json({ received: true, duplicate: true });
      }
    }

    if (
      payload.event === "payment.captured" &&
      payload.payload.payment?.entity
    ) {
      const payment = payload.payload.payment.entity;
      logPaymentEvent("webhook_payment_captured", {
        razorpay_order_id: payment.order_id,
        razorpay_payment_id: payment.id,
      });
      await handleRazorpayPaymentSuccess({
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logPaymentEvent("webhook_error", {
      error: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
