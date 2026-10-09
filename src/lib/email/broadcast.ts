import sanitizeHtml from "sanitize-html";
import { getSiteUrl } from "@/lib/env";

/** Resend's batch endpoint accepts at most 100 messages per request. */
export const BROADCAST_BATCH_SIZE = 100;
/** Hard cap per send so one admin click fits a single serverless invocation. */
export const BROADCAST_MAX_RECIPIENTS = 2000;

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function unsubscribeUrl(token: string): string {
  return `${getSiteUrl()}/unsubscribe?token=${encodeURIComponent(token)}`;
}

/** One-click unsubscribe endpoint advertised in the List-Unsubscribe header. */
export function oneClickUnsubscribeUrl(token: string): string {
  return `${getSiteUrl()}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}

/** Email-safe allowlist: formatting only, no scripts, styles or arbitrary links. */
export function sanitizeEmailBody(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "strong", "em", "b", "i", "u", "ul", "ol", "li",
      "mark", "h2", "h3", "blockquote",
    ],
    allowedAttributes: {},
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Branded wrapper matching the Supabase auth emails. `unsubscribeLink` is per recipient. */
export function buildBroadcastHtml(params: {
  subject: string;
  bodyHtml: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  unsubscribeLink: string;
}): string {
  const site = getSiteUrl();
  const cta =
    params.ctaLabel && params.ctaUrl
      ? `<tr><td align="center" style="padding:8px 40px 24px;">
<a href="${escapeHtml(params.ctaUrl)}" style="display:inline-block;background:#EF6113;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;line-height:20px;padding:14px 36px;border-radius:999px;">${escapeHtml(params.ctaLabel)}</a>
</td></tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(params.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#FEF7F5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FEF7F5;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e9e1dd;border-radius:16px;overflow:hidden;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<tr><td style="background:#B50A20;height:6px;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td align="center" style="padding:28px 32px 8px;">
<img src="${site}/brand/logo-namkeens.png" alt="Jai Jinendra Namkeens" width="160" style="display:block;height:auto;border:0;">
</td></tr>
<tr><td style="padding:16px 40px 8px;text-align:center;">
<h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:34px;font-weight:700;color:#B50A20;">${escapeHtml(params.subject)}</h1>
</td></tr>
<tr><td style="padding:8px 40px 24px;font-size:15px;line-height:24px;color:#4a4543;">${params.bodyHtml}</td></tr>
${cta}
<tr><td align="center" style="background:#faf2ee;padding:18px 32px;font-size:12px;line-height:18px;color:#7a7370;">
<strong style="color:#B50A20;">Jai Jinendra Namkeens</strong><br>
Heritage Rajasthani namkeens, mithai &amp; gifts<br>
<a href="${site}" style="color:#7a7370;">${site.replace(/^https?:\/\//, "")}</a>
<br><br>
You are receiving this because you signed up for offers and updates.<br>
<a href="${escapeHtml(params.unsubscribeLink)}" style="color:#7a7370;text-decoration:underline;">Unsubscribe</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** Plain-text twin of the body, for the text/plain alternative. */
export function bodyToText(bodyHtml: string, unsubscribeLink: string): string {
  const text = sanitizeHtml(bodyHtml.replace(/<\/(p|li|h2|h3|blockquote)>/gi, "\n"), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return `${text}\n\n--\nUnsubscribe: ${unsubscribeLink}`;
}
