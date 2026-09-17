import Razorpay from "razorpay";
import crypto from "crypto";
import { getEnv } from "@/lib/env";

export function getRazorpayClient() {
  const keyId = getEnv("RAZORPAY_KEY_ID", true)!;
  const keySecret = getEnv("RAZORPAY_KEY_SECRET", true)!;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function createRazorpayOrder(params: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const client = getRazorpayClient();
  return client.orders.create({
    amount: params.amountPaise,
    currency: "INR",
    receipt: params.receipt,
    notes: params.notes,
  });
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
