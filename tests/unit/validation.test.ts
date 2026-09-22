import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  addressSchema,
  cartLineSchema,
  createOrderBodySchema,
  paymentVerifyBodySchema,
  phoneSchema,
  trackOrderQuerySchema,
} from "@/lib/validation/schemas";
import { safeRedirectPath, safeAdminRedirectPath } from "@/lib/safe-redirect";

describe("addressSchema", () => {
  it("accepts a valid Indian address", () => {
    const result = addressSchema.safeParse({
      name: "Asha",
      phone: "9876543210",
      email: "asha@example.com",
      line1: "12 MG Road",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302001",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid pincode", () => {
    const result = addressSchema.safeParse({
      name: "Asha",
      phone: "9876543210",
      email: "asha@example.com",
      line1: "12 MG Road",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "000001",
    });
    expect(result.success).toBe(false);
  });
});

describe("paymentVerifyBodySchema", () => {
  it("requires razorpay fields", () => {
    expect(paymentVerifyBodySchema.safeParse({}).success).toBe(false);
    expect(
      paymentVerifyBodySchema.safeParse({
        razorpay_order_id: "order_1",
        razorpay_payment_id: "pay_1",
        razorpay_signature: "sig",
      }).success,
    ).toBe(true);
  });
});

describe("cartLineSchema", () => {
  it("requires sku or variantId", () => {
    expect(cartLineSchema.safeParse({ qty: 1 }).success).toBe(false);
    expect(
      cartLineSchema.safeParse({
        qty: 2,
        variantId: "550e8400-e29b-41d4-a716-446655440000",
      }).success,
    ).toBe(true);
  });
});

describe("trackOrderQuerySchema", () => {
  it("accepts JJ order numbers", () => {
    expect(
      trackOrderQuerySchema.safeParse({
        orderNumber: "JJ-ABC123-XYZ",
        phone: "9876543210",
      }).success,
    ).toBe(true);
  });
});

describe("createOrderBodySchema", () => {
  it("defaults payment method", () => {
    const parsed = createOrderBodySchema.parse({
      name: "Asha",
      phone: "9876543210",
      email: "a@b.co",
      line1: "x",
      city: "Jaipur",
      state: "RJ",
      pincode: "302001",
    });
    expect(parsed.paymentMethod).toBe("razorpay");
  });
});

describe("phoneSchema", () => {
  it("accepts +91 and bare 10-digit", () => {
    expect(phoneSchema.safeParse("9876543210").success).toBe(true);
    expect(phoneSchema.safeParse("+919876543210").success).toBe(true);
  });
});

describe("safeRedirectPath", () => {
  it("blocks open redirects", () => {
    expect(safeRedirectPath("//evil.com", "/account")).toBe("/account");
    expect(safeRedirectPath("https://evil.com", "/account")).toBe("/account");
    expect(safeRedirectPath("/checkout", "/account")).toBe("/checkout");
    expect(safeAdminRedirectPath("/admin/orders", "/admin")).toBe(
      "/admin/orders",
    );
    expect(safeAdminRedirectPath("/account", "/admin")).toBe("/admin");
  });
});
