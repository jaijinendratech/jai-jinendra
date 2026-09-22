import { Resend } from "resend";
import { getEnv, getSiteUrl } from "@/lib/env";

function getResend() {
  return new Resend(getEnv("RESEND_API_KEY", true)!);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 250 * 2 ** i));
      }
    }
  }
  throw lastErr;
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  totalPaise: number;
  paymentMethod: string;
}) {
  const from = getEnv("EMAIL_FROM") ?? "orders@jaijinendra.com";
  const resend = getResend();
  const total = (params.totalPaise / 100).toFixed(2);

  await withRetry(() =>
    resend.emails.send({
      from,
      to: params.to,
      subject: `Order confirmed — ${params.orderNumber}`,
      html: `
      <h1>Thank you for your order!</h1>
      <p>Order <strong>${params.orderNumber}</strong> has been received.</p>
      <p>Total: ₹${total} (${params.paymentMethod.toUpperCase()})</p>
      <p><a href="${getSiteUrl()}/track-order">Track your order</a></p>
    `,
    }),
  );
}

export async function sendOrderStatusEmail(params: {
  to: string;
  orderNumber: string;
  status: string;
}) {
  const from = getEnv("EMAIL_FROM") ?? "orders@jaijinendra.com";
  const resend = getResend();

  await withRetry(() =>
    resend.emails.send({
      from,
      to: params.to,
      subject: `Order ${params.orderNumber} — ${params.status}`,
      html: `
      <p>Your order <strong>${params.orderNumber}</strong> is now <strong>${params.status}</strong>.</p>
      <p><a href="${getSiteUrl()}/track-order">Track your order</a></p>
    `,
    }),
  );
}
