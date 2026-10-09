import { describe, expect, it } from "vitest";
import {
  BROADCAST_BATCH_SIZE,
  buildBroadcastHtml,
  chunk,
  sanitizeEmailBody,
} from "@/lib/email/broadcast";
import { adminBroadcastSchema } from "@/lib/validation/schemas";

describe("broadcast helpers", () => {
  it("splits recipients into batches of at most 100", () => {
    const emails = Array.from({ length: 250 }, (_, i) => `u${i}@x.com`);
    const batches = chunk(emails, BROADCAST_BATCH_SIZE);
    expect(batches.map((b) => b.length)).toEqual([100, 100, 50]);
  });

  it("strips scripts, links and styles from the message", () => {
    const clean = sanitizeEmailBody(
      '<p>Hi <strong>there</strong><script>x()</script><a href="https://evil.test">go</a></p>',
    );
    expect(clean).not.toContain("script");
    expect(clean).not.toContain("href");
    expect(clean).toContain("<strong>there</strong>");
  });

  it("puts a personal unsubscribe link and the CTA in the email", () => {
    const html = buildBroadcastHtml({
      subject: "Diwali offer",
      bodyHtml: "<p>Hello</p>",
      ctaLabel: "Shop now",
      ctaUrl: "https://example.com/shop",
      unsubscribeLink: "https://example.com/unsubscribe?token=abc",
    });
    expect(html).toContain("https://example.com/unsubscribe?token=abc");
    expect(html).toContain("Shop now");
  });
});

describe("adminBroadcastSchema", () => {
  const base = { subject: "Big sale", bodyHtml: "<p>Hi</p>" };

  it("accepts a message without a button", () => {
    expect(adminBroadcastSchema.safeParse(base).success).toBe(true);
  });

  it("requires label and link together, and https", () => {
    expect(
      adminBroadcastSchema.safeParse({ ...base, ctaLabel: "Go" }).success,
    ).toBe(false);
    expect(
      adminBroadcastSchema.safeParse({
        ...base,
        ctaLabel: "Go",
        ctaUrl: "http://insecure.test",
      }).success,
    ).toBe(false);
    expect(
      adminBroadcastSchema.safeParse({
        ...base,
        ctaLabel: "Go",
        ctaUrl: "https://ok.test/x",
      }).success,
    ).toBe(true);
  });
});
