import { createAdminClient } from "@/lib/supabase/admin";
import type { CouponType, Database } from "@/types/database";

export type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];

export type CouponValidationResult =
  | {
      ok: true;
      coupon: CouponRow;
      discountPaise: number;
    }
  | {
      ok: false;
      error: string;
    };

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

/** Compute discount from a coupon row without mutating usage. */
export function computeCouponDiscountPaise(
  coupon: Pick<
    CouponRow,
    "type" | "value" | "max_discount_paise" | "min_order_paise"
  >,
  subtotalPaise: number,
): number {
  if (subtotalPaise < coupon.min_order_paise) return 0;

  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.floor((subtotalPaise * coupon.value) / 100);
    if (coupon.max_discount_paise != null) {
      discount = Math.min(discount, coupon.max_discount_paise);
    }
  } else {
    discount = coupon.value;
  }

  return Math.min(Math.max(discount, 0), subtotalPaise);
}

function couponFailureMessage(code: string): string {
  switch (code) {
    case "coupon_not_found":
    case "not_found":
      return "Invalid coupon code.";
    case "coupon_inactive":
    case "inactive":
      return "This coupon is no longer active.";
    case "coupon_not_started":
    case "not_started":
      return "This coupon is not active yet.";
    case "coupon_expired":
    case "expired":
      return "This coupon has expired.";
    case "coupon_usage_limit":
    case "usage_limit":
      return "This coupon has reached its usage limit.";
    case "coupon_min_order":
    case "min_order":
      return "Order subtotal is below this coupon’s minimum.";
    case "coupon_no_discount":
      return "Coupon does not apply to this order.";
    default:
      return "Could not apply coupon.";
  }
}

export function isCouponCurrentlyValid(
  coupon: CouponRow,
  now = new Date(),
): { ok: true } | { ok: false; error: string } {
  if (!coupon.active) return { ok: false, error: couponFailureMessage("inactive") };
  if (coupon.starts_at && now < new Date(coupon.starts_at)) {
    return { ok: false, error: couponFailureMessage("not_started") };
  }
  if (coupon.expires_at && now > new Date(coupon.expires_at)) {
    return { ok: false, error: couponFailureMessage("expired") };
  }
  if (
    coupon.usage_limit != null &&
    coupon.used_count >= coupon.usage_limit
  ) {
    return { ok: false, error: couponFailureMessage("usage_limit") };
  }
  return { ok: true };
}

/** Preview / soft-validate a code against a subtotal (no usage increment). */
export async function validateCouponCode(
  code: string,
  subtotalPaise: number,
): Promise<CouponValidationResult> {
  const normalized = normalizeCouponCode(code);
  if (!normalized) {
    return { ok: false, error: "Enter a coupon code." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("coupons")
    .select("*")
    .eq("code", normalized)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    return { ok: false, error: couponFailureMessage("not_found") };
  }

  const validity = isCouponCurrentlyValid(data);
  if (!validity.ok) return validity;

  if (subtotalPaise < data.min_order_paise) {
    return { ok: false, error: couponFailureMessage("min_order") };
  }

  const discountPaise = computeCouponDiscountPaise(data, subtotalPaise);
  if (discountPaise <= 0) {
    return { ok: false, error: couponFailureMessage("coupon_no_discount") };
  }

  return { ok: true, coupon: data, discountPaise };
}

/**
 * Atomically redeem a coupon at order time.
 * Returns discount paise; throws Error with a user-facing message on failure.
 */
export async function redeemCouponForOrder(
  couponId: string,
  subtotalPaise: number,
): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("redeem_coupon", {
    p_coupon_id: couponId,
    p_subtotal_paise: subtotalPaise,
  });

  if (error) {
    const msg = error.message ?? "";
    for (const key of [
      "coupon_not_found",
      "coupon_inactive",
      "coupon_not_started",
      "coupon_expired",
      "coupon_usage_limit",
      "coupon_min_order",
      "coupon_no_discount",
    ] as const) {
      if (msg.includes(key)) {
        throw new Error(couponFailureMessage(key));
      }
    }
    throw new Error(couponFailureMessage("unknown"));
  }

  return Number(data ?? 0);
}

export function formatCouponValueLabel(
  type: CouponType,
  value: number,
): string {
  if (type === "percent") return `${value}% off`;
  return `₹${(value / 100).toFixed(value % 100 === 0 ? 0 : 2)} off`;
}
