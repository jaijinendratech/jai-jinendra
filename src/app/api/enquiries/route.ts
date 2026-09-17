import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

export async function POST(request: Request) {
  const body = await request.json();
  const type = body.type as "corporate" | "newsletter" | "support";

  if (!["corporate", "newsletter", "support"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("enquiries").insert({
    type,
    payload: body.payload ?? body,
    status: "new",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
