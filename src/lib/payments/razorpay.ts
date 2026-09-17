import Razorpay from "razorpay";
import crypto from "crypto";
import { getEnv } from "@/lib/env";

export function getRazorpayClient() {
  const keyId = getEnv("RAZORPAY_KEY_ID", true)!;
  const keySecret = getEnv("RAZORPAY_KEY_SECRET", true)!;
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
  return client.orders.create({
    amount: params.amountPaise,
    currency: "INR",
    receipt: params.receipt,
    notes: params.notes,
  });
}

export function verifyRazorpayPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = getEnv("RAZORPAY_KEY_SECRET", true)!;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return expected === params.signature;
}

export function verifyRazorpayWebhookSignature(
  body: string,
  signature: string,
): boolean {
  const secret = getEnv("RAZORPAY_WEBHOOK_SECRET", true)!;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export function getRazorpayKeyId(): string {
  return getEnv("RAZORPAY_KEY_ID", true)!;
}
