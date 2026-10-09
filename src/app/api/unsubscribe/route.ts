import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const tokenSchema = z.string().uuid();

/**
 * Unsubscribe by the per-recipient token from the email footer. POST only:
 * mail scanners prefetch GET links, which must never unsubscribe anyone. Also
 * serves the RFC 8058 one-click `List-Unsubscribe-Post` request.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = await rateLimit({
    key: `unsubscribe:${ip}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const parsed = tokenSchema.safeParse(url.searchParams.get("token"));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid link" }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const admin = createAdminClient();
    await admin
      .from("subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", parsed.data)
      .is("unsubscribed_at", null);
  }

  // Browser form posts land on the confirmation page; one-click clients ignore the body.
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/html")) {
    return NextResponse.redirect(new URL("/unsubscribe?done=1", request.url), 303);
  }
  return NextResponse.json({ ok: true });
}
