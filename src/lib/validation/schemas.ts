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
  couponCode: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .transform((v) => (v ? v.toUpperCase() : undefined)),
  name: z.string().trim().min(1).max(120),
  phone: phoneSchema,
  email: z.string().trim().email().max(200),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  pincode: pincodeSchema,
});

export const applyCouponBodySchema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotalPaise: z.number().int().min(0).optional(),
});

export const adminCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2)
      .max(40)
      .regex(/^[A-Za-z0-9_-]+$/, "Code may only use letters, numbers, _ and -"),
    type: z.enum(["percent", "fixed"]),
    /** percent: 1–100; fixed: rupees (converted to paise in action) */
    value: z.number().positive(),
    minOrderRupees: z.number().min(0).default(0),
    maxDiscountRupees: z.number().positive().nullable().optional(),
    active: z.boolean(),
    startsAt: z.string().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    usageLimit: z.number().int().positive().nullable().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "percent" && (v.value < 1 || v.value > 100)) {
      ctx.addIssue({
        code: "custom",
        message: "Percent must be between 1 and 100",
        path: ["value"],
      });
    }
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

/** Admin customer profile edit — Indian phone + optional real email. */
export const adminCustomerProfileSchema = z.object({
  id: z.string().uuid("Invalid customer id."),
  fullName: z
    .string()
    .trim()
    .max(120, "Name must be 120 characters or fewer."),
  phone: z
    .string()
    .trim()
    .refine((v) => {
      if (!v) return true;
      const digits = v.replace(/\D/g, "");
      return (
        /^[6-9]\d{9}$/.test(digits) || /^91[6-9]\d{9}$/.test(digits)
      );
    }, "Enter a valid 10-digit Indian mobile (+91 optional)."),
  email: z
    .string()
    .trim()
    .max(200, "Email must be 200 characters or fewer.")
    .refine(
      (v) => !v || z.string().email().safeParse(v).success,
      "Enter a valid email or leave blank.",
    )
    .refine(
      (v) =>
        !v ||
        !v.toLowerCase().endsWith("@phone.customers.local"),
      "Cannot save a phone-login placeholder as email. Enter a real email or leave blank.",
    ),
});

export const adminCategorySchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120),
  subtitle: z.string().trim().max(200).optional().nullable(),
  imageUrl: z.string().trim().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  published: z.boolean(),
  featured: z.boolean(),
});

export const adminEnquiryStatusSchema = z.enum([
  "new",
  "in_progress",
  "closed",
]);

export const adminOutletSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  address: z.string().trim().min(1, "Address is required.").max(500),
  phone: z.string().trim().max(20).optional().nullable(),
  hours: z.string().trim().max(200).optional().nullable(),
  lat: z.number().finite().nullable(),
  lng: z.number().finite().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  published: z.boolean(),
});

export const adminOrderShippingSchema = z.object({
  orderId: z.string().min(1, "Missing order id."),
  courierName: z.string().trim().max(120),
  awbCode: z.string().trim().max(80),
  shipmentId: z.string().trim().max(80),
  shippingStatus: z.string().trim().max(80),
  trackingUrl: z
    .string()
    .trim()
    .max(500)
    .refine(
      (v) => !v || /^https?:\/\//i.test(v),
      "Tracking URL must start with http:// or https://",
    ),
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

export const sellingUnitSchema = z.enum(["g", "kg", "pack", "pc", "other"]);

export const adminProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  categoryId: z.string().uuid().nullable(),
  subcategoryId: z.string().uuid().nullable().optional(),
  description: z.string().max(50000).default(""),
  longDescription: z.string().max(100000).nullable().optional(),
  spiceNote: z.string().max(80).nullable().optional(),
  dietary: z.array(z.string()).default([]),
  badge: z.string().max(80).nullable().optional(),
  tagline: z.string().max(200).nullable().optional(),
  seoTitle: z.string().max(120).nullable().optional(),
  seoDescription: z.string().max(320).nullable().optional(),
  origin: z.string().max(120).nullable().optional(),
  shelfLife: z.string().max(120).nullable().optional(),
  ingredients: z.array(z.string()).default([]),
  published: z.boolean(),
  featured: z.boolean(),
  bestseller: z.boolean(),
  newArrival: z.boolean(),
  seasonal: z.boolean().optional(),
});

export const adminVariantSchema = z.object({
  label: z.string().trim().min(1).max(80),
  pricePaise: z.number().int().positive(),
  mrpPaise: z.number().int().positive().nullable().optional(),
  sellingUnit: sellingUnitSchema,
  quantityValue: z.number().positive().nullable().optional(),
  weightG: z.number().int().positive().nullable().optional(),
  stockQty: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  available: z.boolean(),
  sortOrder: z.number().int().min(0).default(0),
});

export const adminSubcategorySchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  subtitle: z.string().max(200).nullable().optional(),
  imageUrl: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  published: z.boolean(),
});

export function parseOrThrow<T>(
  schema: z.ZodType<T>,
  data: unknown,
): T {
  return schema.parse(data);
}

export function zodErrorMessage(err: unknown): string {
  if (err instanceof z.ZodError) {
    return err.issues.map((i) => i.message).join("; ") || "Validation failed";
  }
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object") {
    const maybe = err as {
      error?: { description?: string; reason?: string };
      description?: string;
      message?: string;
    };
    const razorpay =
      maybe.error?.description ||
      maybe.error?.reason ||
      maybe.description ||
      maybe.message;
    if (typeof razorpay === "string" && razorpay.trim()) return razorpay;
  }
  return "Validation failed";
}
