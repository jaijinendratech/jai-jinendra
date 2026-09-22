import { createAdminClient } from "@/lib/supabase/admin";
import { getCartSummary, clearCart, clearCartForUser } from "@/lib/cart/cart-service";
import { calculateOrderTotals } from "@/lib/shipping";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email/resend";
import type { Database, Json } from "@/types/database";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"] & {
  order_items?: Database["public"]["Tables"]["order_items"]["Row"][];
};

export type AddressInput = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  email: string;
};

/** JJ- + base36 timestamp + random; retry on unique violation. */
function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JJ-${ts}-${rand}`;
}

const UNIQUE_VIOLATION = "23505";

export async function validateCheckout(userId: string, address: AddressInput) {
  const cart = await getCartSummary();

  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  if (cart.warnings.length > 0) {
    throw new Error(cart.warnings.join("; "));
  }

  for (const item of cart.items) {
    if (item.qty > item.stockQty) {
      throw new Error(`${item.productName}: insufficient stock`);
    }
  }

  return { cart, userId, address };
}

export async function createOrder(params: {
  userId: string;
  address: AddressInput;
  paymentMethod: "razorpay" | "cod";
  notes?: string;
}) {
  const { cart } = await validateCheckout(params.userId, params.address);
  const admin = createAdminClient();
  const totals = calculateOrderTotals(cart.subtotalPaise);

  const addressSnapshot: Json = {
    ...params.address,
  };

  const initialStatus =
    params.paymentMethod === "cod" ? "cod_confirmed" : "pending_payment";
  const paymentStatus = "pending" as const;

  let order: Database["public"]["Tables"]["orders"]["Row"] | null = null;
  let lastError: { code?: string; message: string } | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const orderNumber = generateOrderNumber();
    const { data, error } = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: params.userId,
        status: initialStatus,
        payment_method: params.paymentMethod,
        payment_status: paymentStatus,
        subtotal_paise: totals.subtotalPaise,
        shipping_paise: totals.shippingPaise,
        total_paise: totals.totalPaise,
        address_snapshot: addressSnapshot,
        customer_email: params.address.email,
        customer_phone: params.address.phone,
        notes: params.notes ?? null,
      })
      .select("*")
      .single();

    if (!error && data) {
      order = data;
      break;
    }

    lastError = error;
    if (error?.code !== UNIQUE_VIOLATION) {
      throw error;
    }
  }

  if (!order) {
    throw lastError ?? new Error("Failed to allocate order number");
  }

  const orderItems = cart.items.map((item) => ({
    order_id: order!.id,
    variant_id: item.variantId,
    qty: item.qty,
    unit_price_paise: item.unitPricePaise,
    name_snapshot: `${item.productName} · ${item.label}`,
    sku_snapshot: item.sku,
  }));

  await admin.from("order_items").insert(orderItems);

  if (params.paymentMethod === "cod") {
    await confirmOrderInventory(order.id);
    await clearCart();
    if (params.address.email) {
      await sendOrderConfirmationEmail({
        to: params.address.email,
        orderNumber: order.order_number,
        totalPaise: totals.totalPaise,
        paymentMethod: "cod",
      }).catch(() => undefined);
    }
    return { order, razorpay: null };
  }

  const rzOrder = await createRazorpayOrder({
    amountPaise: totals.totalPaise,
    receipt: order.order_number,
    notes: { order_id: order.id },
  });

  await admin
    .from("orders")
    .update({ razorpay_order_id: rzOrder.id })
    .eq("id", order.id);

  return { order, razorpay: rzOrder };
}

/**
 * Atomically claim pending payment + decrement stock via Postgres RPC.
 * Safe under concurrent webhook + verify-payment.
 */
export async function confirmOrderInventory(
  orderId: string,
  razorpayPaymentId?: string | null,
) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("confirm_order_payment", {
    p_order_id: orderId,
    p_razorpay_payment_id: razorpayPaymentId ?? null,
  });

  if (error) throw error;
  return data as Database["public"]["Tables"]["orders"]["Row"] | null;
}

export async function handleRazorpayPaymentSuccess(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
}) {
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", params.razorpayOrderId)
    .maybeSingle();

  if (!order) return null;
  if (order.payment_status === "paid" || order.status === "confirmed") {
    return order;
  }

  const confirmed = await confirmOrderInventory(
    order.id,
    params.razorpayPaymentId,
  );

  if (order.user_id) {
    await clearCartForUser(order.user_id);
  }

  if (order.customer_email) {
    await sendOrderConfirmationEmail({
      to: order.customer_email,
      orderNumber: order.order_number,
      totalPaise: order.total_paise,
      paymentMethod: "razorpay",
    }).catch(() => undefined);
  }

  return confirmed ?? order;
}

export async function trackOrder(orderNumber: string, phone: string) {
  const admin = createAdminClient();
  const normalizedPhone = phone.replace(/\D/g, "").slice(-10);

  const { data } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber)
    .maybeSingle();

  const order = data as OrderRow | null;
  if (!order) return null;

  const orderPhone = String(order.customer_phone ?? "")
    .replace(/\D/g, "")
    .slice(-10);
  const snapshotPhone = String(
    (order.address_snapshot as { phone?: string })?.phone ?? "",
  )
    .replace(/\D/g, "")
    .slice(-10);

  if (
    orderPhone !== normalizedPhone &&
    snapshotPhone !== normalizedPhone
  ) {
    return null;
  }

  return order;
}
