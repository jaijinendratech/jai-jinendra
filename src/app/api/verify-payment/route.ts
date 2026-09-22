import { NextResponse } from "next/server";
import { handleRazorpayPaymentSuccess } from "@/lib/orders/create-order";
import { verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay";
import {
  paymentVerifyBodySchema,
  zodErrorMessage,
} from "@/lib/validation/schemas";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { logPaymentEvent } from "@/lib/observability/log";

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = await rateLimit({
      key: `verify-payment:${ip}`,
      limit: 30,
      windowMs: 60_000,
    });
    if (!limited.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const raw = await request.json();
    const body = paymentVerifyBodySchema.parse(raw);

    const valid = verifyRazorpayPaymentSignature({
      orderId: body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
      signature: body.razorpay_signature,
    });

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    logPaymentEvent("verify_payment", {
      razorpay_order_id: body.razorpay_order_id,
    });

    const order = await handleRazorpayPaymentSuccess({
      razorpayOrderId: body.razorpay_order_id,
      razorpayPaymentId: body.razorpay_payment_id,
    });

    return NextResponse.json({
      success: true,
      orderNumber: order?.order_number ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: zodErrorMessage(err) },
      { status: 400 },
    );
  }
}
