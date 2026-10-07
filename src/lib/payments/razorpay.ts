import Razorpay from "razorpay";
import crypto from "crypto";
import { getEnv } from "@/lib/env";

/** Env values pasted into Vercel often carry stray spaces/newlines or quotes. */
function cleanEnv(name: string): string {
  return getEnv(name, true)!.trim().replace(/^["']|["']$/g, "").trim();
}

export const RAZORPAY_UNAVAILABLE_MESSAGE =
  "Online payment is temporarily unavailable. Please choose Cash on Delivery or try again shortly.";

export function getRazorpayCredentials() {
  const keyId = cleanEnv("RAZORPAY_KEY_ID");
  const keySecret = cleanEnv("RAZORPAY_KEY_SECRET");
  if (!/^rzp_(test|live)_/.test(keyId)) {
    throw new Error(
      "RAZORPAY_KEY_ID must start with rzp_test_ or rzp_live_ (check the value in your environment settings).",
    );
  }
  return { keyId, keySecret };
}

export function getRazorpayClient() {
  const { keyId, keySecret } = getRazorpayCredentials();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

const MIN_AMOUNT_PAISE = 100;

export async function createRazorpayOrder(params: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  if (params.amountPaise < MIN_AMOUNT_PAISE) {
    throw new Error(`Amount must be at least ${MIN_AMOUNT_PAISE} paise`);
  }

  const client = getRazorpayClient();
  try {
    return await client.orders.create({
      amount: params.amountPaise,
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes,
    });
  } catch (err) {
    const description =
      err &&
      typeof err === "object" &&
      "error" in err &&
      err.error &&
      typeof err.error === "object" &&
      "description" in err.error
        ? String((err.error as { description?: string }).description ?? "")
        : "";
    const statusCode =
      err && typeof err === "object" && "statusCode" in err
        ? Number((err as { statusCode?: number }).statusCode)
        : 0;
    if (statusCode === 401 || /authentication failed/i.test(description)) {
      // Keys rejected by Razorpay: a deployment/config problem, not the customer's.
      let mode = "unknown";
      try {
        mode = getRazorpayCredentials().keyId.split("_")[1] ?? "unknown";
      } catch {
        /* reported below */
      }
      console.error(
        `[razorpay] Authentication failed (key mode: ${mode}). RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in this environment are not a valid pair for this Razorpay account.`,
      );
      throw new Error(RAZORPAY_UNAVAILABLE_MESSAGE);
    }
    throw new Error(
      description.trim() ||
        (err instanceof Error ? err.message : "Razorpay order creation failed"),
    );
  }
}

function timingSafeEqualHex(expected: string, received: string): boolean {
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(received, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyRazorpayPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = cleanEnv("RAZORPAY_KEY_SECRET");
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return timingSafeEqualHex(expected, params.signature);
}

export function verifyRazorpayWebhookSignature(
  body: string,
  signature: string,
): boolean {
  const secret = cleanEnv("RAZORPAY_WEBHOOK_SECRET");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return timingSafeEqualHex(expected, signature);
}

export function getRazorpayKeyId(): string {
  return getRazorpayCredentials().keyId;
}
