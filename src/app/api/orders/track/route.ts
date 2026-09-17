import { NextResponse } from "next/server";
import { trackOrder } from "@/lib/orders/create-order";
import { isSupabaseConfigured } from "@/lib/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber") ?? "";
  const phone = searchParams.get("phone") ?? "";

  if (!orderNumber || !phone) {
    return NextResponse.json(
      { error: "orderNumber and phone required" },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  const order = await trackOrder(orderNumber, phone);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    totalPaise: order.total_paise,
    createdAt: order.created_at,
    items: "order_items" in order ? order.order_items : [],
  });
}
