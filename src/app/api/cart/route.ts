import { NextResponse } from "next/server";
import { getCartSummary, upsertCartItem } from "@/lib/cart/cart-service";
import { isSupabaseConfigured } from "@/lib/env";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      items: [],
      itemCount: 0,
      subtotalPaise: 0,
      shippingPaise: 0,
      totalPaise: 0,
      warnings: ["Database not configured — cart unavailable"],
    });
  }

  try {
    const cart = await getCartSummary();
    return NextResponse.json(cart);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cart error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const cart = await upsertCartItem({
      sku: body.sku,
      variantId: body.variantId,
      qty: Number(body.qty),
    });
    return NextResponse.json(cart);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cart update failed" },
      { status: 400 },
    );
  }
}
