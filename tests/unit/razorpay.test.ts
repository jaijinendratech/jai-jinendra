import crypto from "crypto";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/payments/razorpay";

describe("razorpay signatures", () => {
  const prevSecret = process.env.RAZORPAY_KEY_SECRET;
  const prevWebhook = process.env.RAZORPAY_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.RAZORPAY_KEY_SECRET = "test_secret";
    process.env.RAZORPAY_WEBHOOK_SECRET = "whsec_test";
  });

  afterEach(() => {
    process.env.RAZORPAY_KEY_SECRET = prevSecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = prevWebhook;
  });

  it("accepts a valid payment signature", () => {
    const orderId = "order_abc";
    const paymentId = "pay_xyz";
    const signature = crypto
      .createHmac("sha256", "test_secret")
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(
      verifyRazorpayPaymentSignature({ orderId, paymentId, signature }),
    ).toBe(true);
  });

  it("rejects a tampered payment signature", () => {
    expect(
      verifyRazorpayPaymentSignature({
        orderId: "order_abc",
        paymentId: "pay_xyz",
        signature: "deadbeef",
      }),
    ).toBe(false);
  });

  it("accepts a valid webhook signature", () => {
    const body = '{"event":"payment.captured"}';
    const signature = crypto
      .createHmac("sha256", "whsec_test")
      .update(body)
      .digest("hex");
    expect(verifyRazorpayWebhookSignature(body, signature)).toBe(true);
  });

  it("rejects mismatched-length webhook signatures without throwing", () => {
    expect(verifyRazorpayWebhookSignature("{}", "short")).toBe(false);
  });
});
