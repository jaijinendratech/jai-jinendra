import { z } from "zod";

/** Indian mobile: 10 digits, optional +91 */
export const phoneSchema = z
  .string()
  .trim()
  .min(10)
  .max(15)
  .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number");

export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, "Invalid pincode");

export const addressSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: phoneSchema,
  email: z.string().trim().email().max(200),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  pincode: pincodeSchema,
});

export const createOrderBodySchema = z.object({
  paymentMethod: z.enum(["razorpay", "cod"]).default("razorpay"),
  notes: z.string().trim().max(500).optional(),
  name: z.string().trim().min(1).max(120),
  phone: phoneSchema,
  email: z.string().trim().email().max(200),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  pincode: pincodeSchema,
});

export const cartLineSchema = z.object({
  sku: z.string().trim().min(1).max(100).optional(),
  variantId: z.string().uuid().optional(),
  qty: z.coerce.number().int().min(0).max(999),
}).refine((v) => Boolean(v.sku || v.variantId), {
  message: "sku or variantId required",
});

export const trackOrderQuerySchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^JJ-[A-Za-z0-9-]+$/, "Invalid order number"),
  phone: phoneSchema,
});

export const paymentVerifyBodySchema = z.object({
  razorpay_order_id: z.string().trim().min(1).max(100),
  razorpay_payment_id: z.string().trim().min(1).max(100),
  razorpay_signature: z.string().trim().min(1).max(200),
});

export const checkoutValidateBodySchema = z.object({
  pincode: pincodeSchema,
});

export const enquiryBodySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("newsletter"),
    payload: z
      .object({
        email: z.string().trim().email().max(200),
      })
      .passthrough()
      .optional(),
    email: z.string().trim().email().max(200).optional(),
  }),
  z.object({
    type: z.literal("corporate"),
    payload: z
      .object({
        name: z.string().trim().min(1).max(120).optional(),
        email: z.string().trim().email().max(200).optional(),
        phone: z.string().trim().max(20).optional(),
        company: z.string().trim().max(200).optional(),
        message: z.string().trim().max(2000).optional(),
      })
      .passthrough()
      .optional(),
  }),
  z.object({
    type: z.literal("support"),
    payload: z
      .object({
        name: z.string().trim().min(1).max(120).optional(),
        email: z.string().trim().email().max(200).optional(),
        message: z.string().trim().max(2000).optional(),
      })
      .passthrough()
      .optional(),
  }),
]);

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional(),
});

export const accountAddressSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1).max(120),
  phone: phoneSchema,
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  pincode: pincodeSchema,
  isDefault: z.boolean().optional(),
});

export const heroSlideSchema = z.object({
  id: z.string().min(1).max(80),
  src: z.string().min(1).max(500),
  alt: z.string().max(200).default(""),
});

export const contentBlockSchema = z.object({
  pageKey: z.string().trim().min(1).max(80),
  sectionKey: z.string().trim().min(1).max(80),
  content: z.record(z.string(), z.unknown()),
});

export const adminOrderStatusSchema = z.enum([
  "pending_payment",
  "cod_confirmed",
  "confirmed",
  "dispatched",
  "delivered",
  "cancelled",
]);

export const adminPaymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export function parseOrThrow<T>(
  schema: z.ZodType<T>,
  data: unknown,
): T {
  return schema.parse(data);
}

export function zodErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "issues" in err) {
    const issues = (err as z.ZodError).issues;
    return issues.map((i) => i.message).join("; ") || "Validation failed";
  }
  if (err instanceof Error) return err.message;
  return "Validation failed";
}
