/** Structured logs for payment paths — no PII/secrets. */
export function logPaymentEvent(
  event: string,
  fields: Record<string, string | number | boolean | null | undefined>,
) {
  const safe: Record<string, unknown> = { event, ts: new Date().toISOString() };
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    // Never log emails, phones, addresses, signatures, secrets
    if (
      /email|phone|address|signature|secret|password|token/i.test(k)
    ) {
      continue;
    }
    safe[k] = v;
  }
  console.info(JSON.stringify(safe));
}
