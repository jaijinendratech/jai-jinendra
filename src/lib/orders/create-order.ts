import { createAdminClient } from "@/lib/supabase/admin";
import { getCartSummary, clearCart } from "@/lib/cart/cart-service";
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

function generateOrderNumber() {
  const n = Math.floor(10000 + Math.random() * 90000);
  return `JJ-${n}`;
}

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
  const orderNumber = generateOrderNumber();
  const totals = calculateOrderTotals(cart.subtotalPaise);

  const addressSnapshot: Json = {
    ...params.address,
  };

  const initialStatus =
    params.paymentMethod === "cod" ? "cod_confirmed" : "pending_payment";
  const paymentStatus = params.paymentMethod === "cod" ? "pending" : "pending";

  const { data: order, error } = await admin
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

  if (error) throw error;

  const orderItems = cart.items.map((item) => ({
    order_id: order.id,
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
        orderNumber,
        totalPaise: totals.totalPaise,
        paymentMethod: "cod",
      }).catch(() => undefined);
    }
    return { order, razorpay: null };
  }

  const rzOrder = await createRazorpayOrder({
    amountPaise: totals.totalPaise,
    receipt: orderNumber,
    notes: { order_id: order.id },
  });

  await admin
    .from("orders")
    .update({ razorpay_order_id: rzOrder.id })
    .eq("id", order.id);

  return { order, razorpay: rzOrder };
}

export async function confirmOrderInventory(orderId: string) {
  const admin = createAdminClient();

  const { data: items } = await admin
    .from("order_items")
    .select("variant_id, qty")
    .eq("order_id", orderId);

  for (const item of items ?? []) {
    if (!item.variant_id) continue;

    const { data: variant } = await admin
      .from("product_variants")
      .select("stock_qty")
      .eq("id", item.variant_id)
      .single();

    if (!variant) continue;

    const newQty = variant.stock_qty - item.qty;
    await admin
      .from("product_variants")
      .update({ stock_qty: Math.max(0, newQty) })
      .eq("id", item.variant_id);

    await admin.from("inventory_logs").insert({
      variant_id: item.variant_id,
      delta: -item.qty,
      reason: "order_confirmed",
      order_id: orderId,
    });
  }

  await admin
    .from("orders")
    .update({
      status: "confirmed",
      payment_status: "paid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
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

  if (!order || order.status === "confirmed") return order;

  await admin
    .from("orders")
    .update({
      razorpay_payment_id: params.razorpayPaymentId,
      payment_status: "paid",
    })
    .eq("id", order.id);

  await confirmOrderInventory(order.id);
  await clearCart();

  if (order.customer_email) {
    await sendOrderConfirmationEmail({
      to: order.customer_email,
      orderNumber: order.order_number,
      totalPaise: order.total_paise,
      paymentMethod: "razorpay",
    }).catch(() => undefined);
  }

  return order;
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

  const orderPhone = String(order.customer_phone ?? "").replace(/\D/g, "").slice(-10);
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
