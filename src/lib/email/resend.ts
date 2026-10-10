import { Resend } from "resend";
import { getEnv, getSiteUrl } from "@/lib/env";
import {
  BROADCAST_BATCH_SIZE,
  bodyToText,
  buildBroadcastHtml,
  chunk,
  oneClickUnsubscribeUrl,
  sanitizeEmailBody,
  unsubscribeUrl,
} from "@/lib/email/broadcast";

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
  discountPaise?: number;
  prepaidDiscountPaise?: number;
}) {
  const from = getEnv("EMAIL_FROM") ?? "orders@jaijinendra.com";
  const resend = getResend();
  const total = (params.totalPaise / 100).toFixed(2);
  const coupon =
    params.discountPaise && params.discountPaise > 0
      ? `<p>Coupon discount: −₹${(params.discountPaise / 100).toFixed(2)}</p>`
      : "";
  const prepaid =
    params.prepaidDiscountPaise && params.prepaidDiscountPaise > 0
      ? `<p>Prepaid discount: −₹${(params.prepaidDiscountPaise / 100).toFixed(2)}</p>`
      : "";

  await withRetry(() =>
    resend.emails.send({
      from,
      to: params.to,
      subject: `Order confirmed, ${params.orderNumber}`,
      html: `
      <h1>Thank you for your order!</h1>
      <p>Order <strong>${params.orderNumber}</strong> has been received.</p>
      ${coupon}
      ${prepaid}
      <p>Total: ₹${total} (${params.paymentMethod.toUpperCase()})</p>
      <p><a href="${getSiteUrl()}/track-order">Track your order</a></p>
    `,
    }),
  );
}

/** Delivers the welcome-offer coupon claimed through the homepage popup. */
export async function sendOfferCouponEmail(params: {
  to: string;
  name: string;
  couponCode: string;
}) {
  const from = getEnv("EMAIL_FROM") ?? "orders@jaijinendra.com";
  const resend = getResend();
  const name = escapeHtml(params.name);

  await withRetry(() =>
    resend.emails.send({
      from,
      to: params.to,
      subject: "Your 10% off coupon from Jai Jinendra",
      html: `
      <h1>Namaste ${name}, welcome to Jai Jinendra!</h1>
      <p>Here is your 10% off coupon for your first order:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#b30f2f">${escapeHtml(params.couponCode)}</p>
      <p>Enter it at checkout to claim your discount.</p>
      <p><a href="${getSiteUrl()}/catalogue">Start shopping</a></p>
    `,
    }),
  );
}

/** Alerts the shop owner that a new order was placed. */
export async function sendNewOrderAlertEmail(params: {
  orderNumber: string;
  totalPaise: number;
  paymentMethod: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
}) {
  const to = getEnv("ORDER_NOTIFY_EMAIL") ?? getEnv("ADMIN_EMAIL");
  if (!to) return;
  const from = getEnv("EMAIL_FROM") ?? "orders@jaijinendra.com";
  const resend = getResend();
  const total = (params.totalPaise / 100).toFixed(2);
  const line = (label: string, value?: string | null) =>
    value ? `<p>${label}: ${escapeHtml(value)}</p>` : "";

  await withRetry(() =>
    resend.emails.send({
      from,
      to,
      subject: `New order ${params.orderNumber}, ₹${total} (${params.paymentMethod.toUpperCase()})`,
      html: `
      <h1>New order received</h1>
      <p>Order <strong>${escapeHtml(params.orderNumber)}</strong></p>
      <p>Total: ₹${total} (${escapeHtml(params.paymentMethod.toUpperCase())})</p>
      ${line("Customer", params.customerName)}
      ${line("Phone", params.customerPhone)}
      ${line("Email", params.customerEmail)}
      <p><a href="${getSiteUrl()}/admin/orders">Open in admin</a></p>
    `,
    }),
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
      subject: `Order ${params.orderNumber}, ${params.status}`,
      html: `
      <p>Your order <strong>${params.orderNumber}</strong> is now <strong>${params.status}</strong>.</p>
      <p><a href="${getSiteUrl()}/track-order">Track your order</a></p>
    `,
    }),
  );
}

export type BroadcastRecipient = { email: string; unsubscribeToken: string };

/**
 * Send one campaign to many recipients: personalised unsubscribe link and
 * List-Unsubscribe headers per recipient, batched 100 per Resend request with a
 * short pause between requests to stay under the API rate limit. A failed
 * batch is retried, then counted as failed without stopping the rest.
 */
export async function sendBroadcast(params: {
  subject: string;
  bodyHtml: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  recipients: BroadcastRecipient[];
}): Promise<{ sent: number; failed: number; errors: string[] }> {
  const from = getEnv("EMAIL_FROM") ?? "orders@jaijinendra.com";
  const resend = getResend();
  const body = sanitizeEmailBody(params.bodyHtml);

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  const batches = chunk(params.recipients, BROADCAST_BATCH_SIZE);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const payload = batch.map((r) => {
      const link = unsubscribeUrl(r.unsubscribeToken);
      return {
        from,
        to: r.email,
        subject: params.subject,
        html: buildBroadcastHtml({
          subject: params.subject,
          bodyHtml: body,
          ctaLabel: params.ctaLabel,
          ctaUrl: params.ctaUrl,
          unsubscribeLink: link,
        }),
        text: bodyToText(body, link),
        headers: {
          "List-Unsubscribe": `<${oneClickUnsubscribeUrl(r.unsubscribeToken)}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      };
    });

    try {
      await withRetry(async () => {
        const { error } = await resend.batch.send(payload);
        if (error) throw new Error(error.message);
      });
      sent += batch.length;
    } catch (err) {
      failed += batch.length;
      errors.push(err instanceof Error ? err.message : "Batch failed");
    }

    // Resend allows ~2 requests/second by default.
    if (i < batches.length - 1) await new Promise((r) => setTimeout(r, 600));
  }

  return { sent, failed, errors };
}
