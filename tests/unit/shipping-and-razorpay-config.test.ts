import { afterEach, describe, expect, it } from "vitest";
import { parcelWeightKg } from "@/lib/orders/shipping";
import { getRazorpayCredentials } from "@/lib/payments/razorpay";

describe("parcelWeightKg", () => {
  it("falls back to the default when no weights are known", () => {
    expect(parcelWeightKg([{ qty: 2, weightG: null }])).toBe(0.5);
    expect(parcelWeightKg([])).toBe(0.5);
  });

  it("sums qty x grams and adds packaging", () => {
    // 2 x 500g + 1 x 250g = 1.25kg + 0.1kg packaging
    expect(
      parcelWeightKg([
        { qty: 2, weightG: 500 },
        { qty: 1, weightG: 250 },
      ]),
    ).toBe(1.35);
  });
});

describe("getRazorpayCredentials", () => {
  const prevId = process.env.RAZORPAY_KEY_ID;
  const prevSecret = process.env.RAZORPAY_KEY_SECRET;

  afterEach(() => {
    process.env.RAZORPAY_KEY_ID = prevId;
    process.env.RAZORPAY_KEY_SECRET = prevSecret;
  });

  it("trims whitespace and surrounding quotes pasted into env settings", () => {
    process.env.RAZORPAY_KEY_ID = ' "rzp_test_abc123" \n';
    process.env.RAZORPAY_KEY_SECRET = " secret \n";
    expect(getRazorpayCredentials()).toEqual({
      keyId: "rzp_test_abc123",
      keySecret: "secret",
    });
  });

  it("rejects a key id that is not a Razorpay key", () => {
    process.env.RAZORPAY_KEY_ID = "not-a-key";
    process.env.RAZORPAY_KEY_SECRET = "secret";
    expect(() => getRazorpayCredentials()).toThrow(/rzp_test_ or rzp_live_/);
  });
});
