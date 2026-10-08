import { NextResponse } from "next/server";
import { z } from "zod";
import { abandonUnpaidOrder } from "@/lib/orders/create-order";
import { getCustomerSessionUser } from "@/lib/auth";

const bodySchema = z.object({ orderId: z.string().uuid() });

/** Customer closed the payment window: drop the unpaid order. */
export async function POST(request: Request) {
  const user = await getCustomerSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Customer login required" },
      { status: 401 },
    );
  }
  try {
    const { orderId } = bodySchema.parse(await request.json());
    const removed = await abandonUnpaidOrder(orderId, user.id);
    return NextResponse.json({ removed });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
