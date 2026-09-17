import { NextResponse } from "next/server";
import { handleRazorpayPaymentSuccess } from "@/lib/orders/create-order";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  try {
    if (!verifyRazorpayWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body) as {
      event: string;
      payload: {
        payment?: { entity: { order_id: string; id: string } };
      };
    };

    if (
      payload.event === "payment.captured" &&
      payload.payload.payment?.entity
    ) {
      const payment = payload.payload.payment.entity;
      await handleRazorpayPaymentSuccess({
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
      });
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
