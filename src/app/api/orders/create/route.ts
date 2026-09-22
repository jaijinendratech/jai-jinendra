import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/orders/create-order";
import { isSupabaseConfigured } from "@/lib/env";
import { getRazorpayKeyId } from "@/lib/payments/razorpay";
import {
  createOrderBodySchema,
  zodErrorMessage,
} from "@/lib/validation/schemas";

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
    const raw = await request.json();
    const body = createOrderBodySchema.parse(raw);

    const result = await createOrder({
      userId: user.id,
      paymentMethod: body.paymentMethod,
      notes: body.notes,
      address: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        line1: body.line1,
        line2: body.line2 ?? undefined,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
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
      { error: zodErrorMessage(err) },
      { status: 400 },
    );
  }
}
