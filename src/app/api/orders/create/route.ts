import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders/create-order";
import { isSupabaseConfigured } from "@/lib/env";
import { getRazorpayKeyId } from "@/lib/payments/razorpay";
import {
  createOrderBodySchema,
  zodErrorMessage,
} from "@/lib/validation/schemas";
import { getCustomerSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  const user = await getCustomerSessionUser();

  if (!user) {
    return NextResponse.json(
      { error: "Customer login required" },
      { status: 401 },
    );
  }

  try {
    const raw = await request.json();
    const body = createOrderBodySchema.parse(raw);

    const result = await createOrder({
      userId: user.id,
      paymentMethod: body.paymentMethod,
      notes: body.notes,
      couponCode: body.couponCode,
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
        discountPaise: result.order.discount_paise,
        couponCode: result.order.coupon_code,
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
    const message = zodErrorMessage(err);
    console.error("[orders/create]", message, err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
