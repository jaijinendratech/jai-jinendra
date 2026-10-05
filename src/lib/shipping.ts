import {
  FLAT_SHIPPING_PAISE,
  FREE_SHIPPING_THRESHOLD_PAISE,
  PREPAID_DISCOUNT_PAISE,
} from "@/lib/cart/constants";

/** v1: static 6-digit pincode check (India). */
export function isValidPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

export function calculateShippingPaise(subtotalPaise: number): number {
  if (subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE) return 0;
  return FLAT_SHIPPING_PAISE;
}

export function calculateOrderTotals(
  subtotalPaise: number,
  discountPaise = 0,
  opts?: { prepaid?: boolean },
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
  const shippingPaise = calculateShippingPaise(subtotalPaise);
  return {
    subtotalPaise,
    discountPaise: safeDiscount,
    prepaidDiscountPaise,
    shippingPaise,
    totalPaise: discountedSubtotal + shippingPaise,
  };
}
