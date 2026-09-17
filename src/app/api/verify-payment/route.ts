import { NextResponse } from "next/server";
import { handleRazorpayPaymentSuccess } from "@/lib/orders/create-order";
import { verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const razorpayOrderId = String(body.razorpay_order_id ?? "");
    const razorpayPaymentId = String(body.razorpay_payment_id ?? "");
    const razorpaySignature = String(body.razorpay_signature ?? "");

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 },
      );
    }

    const valid = verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!valid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const order = await handleRazorpayPaymentSuccess({
      razorpayOrderId,
      razorpayPaymentId,
    });

    return NextResponse.json({
      success: true,
      orderNumber: order?.order_number ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
