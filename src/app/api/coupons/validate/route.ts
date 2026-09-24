import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getCustomerSessionUser } from "@/lib/auth";
import { getCartSummary } from "@/lib/cart/cart-service";
import { validateCouponCode } from "@/lib/coupons";
import { calculateOrderTotals } from "@/lib/shipping";
import {
  applyCouponBodySchema,
  zodErrorMessage,
} from "@/lib/validation/schemas";

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
    const body = applyCouponBodySchema.parse(raw);
    const cart = await getCartSummary();
    const subtotalPaise = body.subtotalPaise ?? cart.subtotalPaise;

    const result = await validateCouponCode(body.code, subtotalPaise);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const totals = calculateOrderTotals(subtotalPaise, result.discountPaise);

    return NextResponse.json({
      code: result.coupon.code,
      type: result.coupon.type,
      discountPaise: result.discountPaise,
      subtotalPaise: totals.subtotalPaise,
      shippingPaise: totals.shippingPaise,
      totalPaise: totals.totalPaise,
    });
  } catch (err) {
    return NextResponse.json(
      { error: zodErrorMessage(err) },
      { status: 400 },
    );
  }
}
