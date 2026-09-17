import { NextResponse } from "next/server";
import {
  createRazorpayOrder,
  getRazorpayKeyId,
} from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const currency = String(body.currency ?? "INR");
    const receipt = String(body.receipt ?? `rcpt_${Date.now()}`);

    if (!Number.isFinite(amount) || amount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise" },
        { status: 400 },
      );
    }

    if (currency !== "INR") {
      return NextResponse.json(
        { error: "Only INR currency is supported" },
        { status: 400 },
      );
    }

    const order = await createRazorpayOrder({
      amountPaise: Math.round(amount),
      receipt,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: getRazorpayKeyId(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Order creation failed";

    if (
      message.includes("Missing required environment variable") ||
      message.toLowerCase().includes("authentication") ||
      message.toLowerCase().includes("unauthorized")
    ) {
      return NextResponse.json({ error: "Razorpay authentication failed" }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
