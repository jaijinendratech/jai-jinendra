import { PREPAID_DISCOUNT_PAISE } from "@/lib/cart/constants";
import { DEFAULT_SHIPPING_RULE, type ShippingRule } from "@/lib/shipping-rule";

/** v1: static 6-digit pincode check (India). */
export function isValidPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

export function calculateShippingPaise(
  subtotalPaise: number,
  rule: ShippingRule = DEFAULT_SHIPPING_RULE,
): number {
  if (subtotalPaise >= rule.freeAbovePaise) return 0;
  return rule.flatPaise;
}

export function calculateOrderTotals(
  subtotalPaise: number,
  discountPaise = 0,
  opts?: { prepaid?: boolean; shippingRule?: ShippingRule },
) {
  const safeSubtotal = Math.max(0, subtotalPaise);
  const safeDiscount = Math.min(Math.max(0, discountPaise), safeSubtotal);
  const afterCoupon = safeSubtotal - safeDiscount;
  const prepaidDiscountPaise = opts?.prepaid
    ? Math.min(PREPAID_DISCOUNT_PAISE, afterCoupon)
    : 0;
  const discountedSubtotal = Math.max(
    0,
    subtotalPaise - safeDiscount - prepaidDiscountPaise,
  );
  // Free-shipping threshold is evaluated on pre-discount subtotal (common retail UX).
  const shippingPaise = calculateShippingPaise(subtotalPaise, opts?.shippingRule);
  return {
    subtotalPaise,
    discountPaise: safeDiscount,
    prepaidDiscountPaise,
    shippingPaise,
    totalPaise: discountedSubtotal + shippingPaise,
  };
}
