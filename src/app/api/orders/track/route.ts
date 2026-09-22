import { NextResponse } from "next/server";
import { trackOrder } from "@/lib/orders/create-order";
import { isSupabaseConfigured } from "@/lib/env";
import {
  trackOrderQuerySchema,
  zodErrorMessage,
} from "@/lib/validation/schemas";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = await rateLimit({
      key: `track:${ip}`,
      limit: 20,
      windowMs: 60_000,
    });
    if (!limited.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = trackOrderQuerySchema.parse({
      orderNumber: searchParams.get("orderNumber") ?? "",
      phone: searchParams.get("phone") ?? "",
    });

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 },
      );
    }

    const order = await trackOrder(parsed.orderNumber, parsed.phone);
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
  } catch (err) {
    return NextResponse.json(
      { error: zodErrorMessage(err) },
      { status: 400 },
    );
  }
}
