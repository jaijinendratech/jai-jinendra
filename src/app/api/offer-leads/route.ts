import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { offerLeadBodySchema, zodErrorMessage } from "@/lib/validation/schemas";

const COUPON_CODE = "FLAT10";

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = await rateLimit({
      key: `offer-leads:${ip}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!limited.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const raw = await request.json();
    const body = offerLeadBodySchema.parse(raw);

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ ok: true, demo: true, couponCode: COUPON_CODE });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("offer_leads").insert({
      full_name: body.fullName,
      phone: body.phone,
      coupon_code: COUPON_CODE,
      source: "offer_popup",
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({
          ok: true,
          already: true,
          couponCode: COUPON_CODE,
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, couponCode: COUPON_CODE });
  } catch (err) {
    return NextResponse.json(
      { error: zodErrorMessage(err) },
      { status: 400 },
    );
  }
}
