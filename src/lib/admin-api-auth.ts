import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-config";
import { ADMIN_REQUEST_HEADER } from "@/lib/admin-request-header";

/**
 * Auth gate for `/api/admin/*` route handlers.
 * Prefer the proxy header when present; otherwise verify the Supabase session
 * and resolve role via the service-role client (avoids RLS edge cases).
 */
export async function assertAdminApiAccess(): Promise<boolean> {
  const headerList = await headers();
  if (headerList.get(ADMIN_REQUEST_HEADER) === "1") {
    return true;
  }

  if (!isSupabaseConfigured()) {
    const jar = await cookies();
    return jar.get(ADMIN_SESSION_COOKIE)?.value === "1";
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    // Service role bypasses RLS so a missing/failed profiles SELECT cannot
    // falsely reject a real admin session during multipart uploads.
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role === "admin") return true;
  } catch {
    // Fall through to the user-scoped check when the service role key is missing.
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role === "admin";
}
