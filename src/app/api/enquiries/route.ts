import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { enquiryBodySchema, zodErrorMessage } from "@/lib/validation/schemas";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = await rateLimit({
      key: `enquiry:${ip}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!limited.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const raw = await request.json();
    const body = enquiryBodySchema.parse(raw);

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ ok: true, demo: true });
    }

    const payload =
      body.type === "newsletter"
        ? ({
            ...(body.payload ?? {}),
            email: body.email ?? body.payload?.email,
          } as Record<string, unknown>)
        : ((body.payload ?? body) as Record<string, unknown>);

    const admin = createAdminClient();
    const { error } = await admin.from("enquiries").insert({
      type: body.type,
      payload: payload as import("@/types/database").Json,
      status: "new",
    });

    if (error) {
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
