import {
  FLAT_SHIPPING_PAISE,
  FREE_SHIPPING_THRESHOLD_PAISE,
} from "@/lib/cart/constants";

/** Admin-editable storefront shipping charge (content_blocks: store / shipping). */
export type ShippingRule = {
  /** Charged when the subtotal is below the free-shipping threshold. */
  flatPaise: number;
  /** Subtotal (before discounts) at or above which shipping is free. */
  freeAbovePaise: number;
};

export const DEFAULT_SHIPPING_RULE: ShippingRule = {
  flatPaise: FLAT_SHIPPING_PAISE,
  freeAbovePaise: FREE_SHIPPING_THRESHOLD_PAISE,
};

export const SHIPPING_MAX_PAISE = 1_000_000; // ₹10,000 sanity cap

function paise(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(SHIPPING_MAX_PAISE, Math.max(0, Math.round(n)));
}

export function parseShippingRule(raw: unknown): ShippingRule {
  if (!raw || typeof raw !== "object") return DEFAULT_SHIPPING_RULE;
  const c = raw as Record<string, unknown>;
  return {
    flatPaise: paise(c.flatPaise, DEFAULT_SHIPPING_RULE.flatPaise),
    freeAbovePaise: paise(c.freeAbovePaise, DEFAULT_SHIPPING_RULE.freeAbovePaise),
  };
}
