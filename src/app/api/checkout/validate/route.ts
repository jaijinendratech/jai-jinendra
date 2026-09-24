import { NextResponse } from "next/server";
import { getCartSummary } from "@/lib/cart/cart-service";
import { isValidPincode } from "@/lib/shipping";
import { isSupabaseConfigured } from "@/lib/env";
import {
  checkoutValidateBodySchema,
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
    const body = checkoutValidateBodySchema.parse(raw);

    if (!isValidPincode(body.pincode)) {
      return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
    }

    const cart = await getCartSummary();
    if (cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (cart.warnings.length > 0) {
      return NextResponse.json(
        { error: cart.warnings.join("; ") },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, cart });
  } catch (err) {
    return NextResponse.json(
      { error: zodErrorMessage(err) },
      { status: 400 },
    );
  }
}
