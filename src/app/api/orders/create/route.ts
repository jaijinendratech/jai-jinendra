import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/orders/create-order";
import { isSupabaseConfigured } from "@/lib/env";
import { getRazorpayKeyId } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const paymentMethod = body.paymentMethod === "cod" ? "cod" : "razorpay";

    const result = await createOrder({
      userId: user.id,
      paymentMethod,
      notes: body.notes,
      address: {
        name: String(body.name ?? ""),
        phone: String(body.phone ?? ""),
        email: String(body.email ?? ""),
        line1: String(body.line1 ?? ""),
        line2: body.line2 ? String(body.line2) : undefined,
        city: String(body.city ?? ""),
        state: String(body.state ?? ""),
        pincode: String(body.pincode ?? ""),
      },
    });

    return NextResponse.json({
      order: {
        id: result.order.id,
        orderNumber: result.order.order_number,
        status: result.order.status,
        totalPaise: result.order.total_paise,
      },
      razorpay: result.razorpay
        ? {
            orderId: result.razorpay.id,
            amount: result.razorpay.amount,
            currency: result.razorpay.currency,
            keyId: getRazorpayKeyId(),
          }
        : null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Order creation failed" },
      { status: 400 },
    );
  }
}
