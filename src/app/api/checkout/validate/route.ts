import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCartSummary } from "@/lib/cart/cart-service";
import { isValidPincode } from "@/lib/shipping";
import { isSupabaseConfigured } from "@/lib/env";

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

  const body = await request.json();
  const pincode = String(body.pincode ?? "");

  if (!isValidPincode(pincode)) {
    return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
  }

  const cart = await getCartSummary();
  if (cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  if (cart.warnings.length > 0) {
    return NextResponse.json({ error: cart.warnings.join("; ") }, { status: 400 });
  }

  return NextResponse.json({ ok: true, cart });
}
