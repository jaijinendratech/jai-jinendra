import { Resend } from "resend";
import { getEnv, getSiteUrl } from "@/lib/env";

function getResend() {
  return new Resend(getEnv("RESEND_API_KEY", true)!);
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

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Order confirmed — ${params.orderNumber}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Order <strong>${params.orderNumber}</strong> has been received.</p>
      <p>Total: ₹${total} (${params.paymentMethod.toUpperCase()})</p>
      <p><a href="${getSiteUrl()}/track-order">Track your order</a></p>
    `,
  });
}

export async function sendOrderStatusEmail(params: {
  to: string;
  orderNumber: string;
  status: string;
}) {
  const from = getEnv("EMAIL_FROM") ?? "orders@jaijinendra.com";
  const resend = getResend();

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Order ${params.orderNumber} — ${params.status}`,
    html: `
      <p>Your order <strong>${params.orderNumber}</strong> is now <strong>${params.status}</strong>.</p>
      <p><a href="${getSiteUrl()}/track-order">Track your order</a></p>
    `,
  });
}
