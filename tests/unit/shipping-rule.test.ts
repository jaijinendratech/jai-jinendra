import { describe, expect, it } from "vitest";
import { calculateOrderTotals, calculateShippingPaise } from "@/lib/shipping";
import { DEFAULT_SHIPPING_RULE, parseShippingRule } from "@/lib/shipping-rule";

describe("shipping rule", () => {
  it("defaults to ₹79 flat, free from ₹999", () => {
    expect(calculateShippingPaise(99899)).toBe(7900);
    expect(calculateShippingPaise(99900)).toBe(0);
  });

  it("uses an admin-set rule in totals", () => {
    const rule = { flatPaise: 12000, freeAbovePaise: 149900 };
    const t = calculateOrderTotals(100000, 0, { shippingRule: rule });
    expect(t.shippingPaise).toBe(12000);
    expect(t.totalPaise).toBe(112000);
    expect(calculateOrderTotals(149900, 0, { shippingRule: rule }).shippingPaise).toBe(0);
  });

  it("falls back to defaults for missing or invalid stored values", () => {
    expect(parseShippingRule(null)).toEqual(DEFAULT_SHIPPING_RULE);
    expect(parseShippingRule({ flatPaise: "x", freeAbovePaise: -5 })).toEqual({
      flatPaise: DEFAULT_SHIPPING_RULE.flatPaise,
      freeAbovePaise: 0,
    });
  });
});
