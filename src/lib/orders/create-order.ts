import { createAdminClient } from "@/lib/supabase/admin";
import { getCartSummary, clearCart, clearCartForUser } from "@/lib/cart/cart-service";
import { calculateOrderTotals } from "@/lib/shipping";
import {
  redeemCouponForOrder,
  validateCouponCode,
} from "@/lib/coupons";
import {
  createRazorpayOrder,
  RAZORPAY_UNAVAILABLE_MESSAGE,
} from "@/lib/payments/razorpay";
import {
  sendNewOrderAlertEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email/resend";
import { ensureShiprocketShipment } from "@/lib/orders/shipping";
import { after } from "next/server";
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

/**
 * Create the Shiprocket shipment after the response is sent. Never blocks or
 * fails the order: errors are stored on the order for the admin to retry.
 */
function queueShipment(orderId: string) {
  after(async () => {
    await ensureShiprocketShipment(orderId);
  });
}

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
  couponCode?: string;
}) {
  const { cart } = await validateCheckout(params.userId, params.address);
  const admin = createAdminClient();

  // Nothing is written (no order row, no coupon redemption, no stock change)
  // until every step that can fail for config/payment reasons has succeeded.
  let couponId: string | null = null;
  let couponCode: string | null = null;
  let discountPaise = 0;

  if (params.couponCode?.trim()) {
    const preview = await validateCouponCode(
      params.couponCode,
      cart.subtotalPaise,
    );
    if (!preview.ok) {
      throw new Error(preview.error);
    }
    discountPaise = preview.discountPaise;
    couponId = preview.coupon.id;
    couponCode = preview.coupon.code;
  }

  const totals = calculateOrderTotals(cart.subtotalPaise, discountPaise, {
    prepaid: params.paymentMethod === "razorpay",
  });

  // 1. Online payments: get the gateway order first. If keys are missing or
  //    rejected this throws here, before anything is stored.
  let rzOrder: Awaited<ReturnType<typeof createRazorpayOrder>> | null = null;
  if (params.paymentMethod === "razorpay") {
    try {
      rzOrder = await createRazorpayOrder({
        amountPaise: totals.totalPaise,
        receipt: generateOrderNumber(),
        notes: { user_id: params.userId },
      });
    } catch (err) {
      // Missing/invalid keys or gateway errors are not the customer's to fix.
      console.error("[orders/create] Razorpay order failed", err);
      throw new Error(RAZORPAY_UNAVAILABLE_MESSAGE);
    }
  }

  // 2. Redeem the coupon (atomic usage check) only once payment can proceed.
  if (couponId) {
    const redeemed = await redeemCouponForOrder(couponId, cart.subtotalPaise);
    if (redeemed !== discountPaise) {
      throw new Error("Coupon changed while placing the order. Please retry.");
    }
  }

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
        discount_paise: totals.discountPaise,
        prepaid_discount_paise: totals.prepaidDiscountPaise,
        shipping_paise: totals.shippingPaise,
        total_paise: totals.totalPaise,
        coupon_id: couponId,
        coupon_code: couponCode,
        address_snapshot: addressSnapshot,
        customer_email: params.address.email,
        customer_phone: params.address.phone,
        notes: params.notes ?? null,
        razorpay_order_id: rzOrder?.id ?? null,
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

  const { error: itemsError } = await admin
    .from("order_items")
    .insert(orderItems);
  if (itemsError) {
    // Never leave a half-written order behind.
    await admin.from("orders").delete().eq("id", order.id);
    throw itemsError;
  }

  if (params.paymentMethod === "cod") {
    await confirmOrderInventory(order.id);
    queueShipment(order.id);
    await clearCart();
    await sendNewOrderAlertEmail({
      orderNumber: order.order_number,
      totalPaise: totals.totalPaise,
      paymentMethod: "cod",
      customerName: params.address.name,
      customerPhone: params.address.phone,
      customerEmail: params.address.email,
    }).catch(() => undefined);
    if (params.address.email) {
      await sendOrderConfirmationEmail({
        to: params.address.email,
        orderNumber: order.order_number,
        totalPaise: totals.totalPaise,
        discountPaise: totals.discountPaise,
        prepaidDiscountPaise: totals.prepaidDiscountPaise,
        paymentMethod: "cod",
      }).catch(() => undefined);
    }
    return { order, razorpay: null };
  }

  return { order, razorpay: rzOrder };
}

/**
 * Discard an online order the customer never paid for (closed the payment
 * window). Only unpaid, customer-owned orders are removed; the coupon use is
 * released so it can be redeemed again.
 */
export async function abandonUnpaidOrder(orderId: string, userId: string) {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, coupon_id")
    .eq("id", orderId)
    .eq("user_id", userId)
    .eq("status", "pending_payment")
    .eq("payment_status", "pending")
    .maybeSingle();
  if (!order) return false;

  const { data: deleted } = await admin
    .from("orders")
    .delete()
    .eq("id", order.id)
    .eq("status", "pending_payment")
    .eq("payment_status", "pending")
    .select("id");
  if (!deleted?.length) return false;

  if (order.coupon_id) {
    const { data: coupon } = await admin
      .from("coupons")
      .select("used_count")
      .eq("id", order.coupon_id)
      .maybeSingle();
    if (coupon && coupon.used_count > 0) {
      await admin
        .from("coupons")
        .update({ used_count: coupon.used_count - 1 })
        .eq("id", order.coupon_id);
    }
  }
  return true;
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

  queueShipment(order.id);

  if (order.user_id) {
    await clearCartForUser(order.user_id);
  }

  await sendNewOrderAlertEmail({
    orderNumber: order.order_number,
    totalPaise: order.total_paise,
    paymentMethod: "razorpay",
    customerName: (order.address_snapshot as { name?: string } | null)?.name,
    customerPhone: order.customer_phone,
    customerEmail: order.customer_email,
  }).catch(() => undefined);

  if (order.customer_email) {
    await sendOrderConfirmationEmail({
      to: order.customer_email,
      orderNumber: order.order_number,
      totalPaise: order.total_paise,
      discountPaise: order.discount_paise,
      prepaidDiscountPaise: order.prepaid_discount_paise,
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
