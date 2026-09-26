import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { subscribeBodySchema, zodErrorMessage } from "@/lib/validation/schemas";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = await rateLimit({
      key: `subscribers:${ip}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!limited.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const raw = await request.json();
    const body = subscribeBodySchema.parse(raw);

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ ok: true, demo: true });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("subscribers").insert({
      email: body.email,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, already: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: zodErrorMessage(err) },
      { status: 400 },
    );
  }
}
