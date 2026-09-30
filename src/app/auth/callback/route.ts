import { NextResponse, type NextRequest } from "next/server";
import { getProfileRole } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

function redirectBase(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(
    /\/$/,
    "",
  );
  if (configured) return configured;
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeRedirectPath(
    request.nextUrl.searchParams.get("next"),
    "/account",
  );
  const base = redirectBase(request);

  const loginUrl = new URL("/login", base);
  loginUrl.searchParams.set("next", next);

  if (!code) {
    loginUrl.searchParams.set("error", "invalid_credentials");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    loginUrl.searchParams.set("error", "invalid_credentials");
    return NextResponse.redirect(loginUrl);
  }

  const role = await getProfileRole(data.user.id);
  if (role === "admin") {
    await supabase.auth.signOut();
    loginUrl.searchParams.set("error", "admin_use_admin_login");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, base));
}
