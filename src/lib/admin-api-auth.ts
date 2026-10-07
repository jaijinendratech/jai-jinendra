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
 *
 * Every rejection path logs a reason tag so a 401 here is diagnosable from
 * server/function logs instead of being a silent black box.
 */
export async function assertAdminApiAccess(): Promise<boolean> {
  const headerList = await headers();
  if (headerList.get(ADMIN_REQUEST_HEADER) === "1") {
    return true;
  }

  if (!isSupabaseConfigured()) {
    const jar = await cookies();
    const ok = jar.get(ADMIN_SESSION_COOKIE)?.value === "1";
    if (!ok) {
      console.error(
        "[assertAdminApiAccess] rejected: Supabase not configured and no dev admin session cookie",
      );
    }
    return ok;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (!user) {
    console.error(
      "[assertAdminApiAccess] rejected: no authenticated Supabase user on request",
      userError ? { authError: userError.message } : undefined,
    );
    return false;
  }

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
  } catch (err) {
    console.error(
      "[assertAdminApiAccess] service-role profile lookup failed, falling back to RLS-scoped check",
      err instanceof Error ? err.message : err,
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    console.error(
      `[assertAdminApiAccess] rejected: user ${user.id} has role "${profile?.role ?? "none"}", not admin`,
    );
    return false;
  }
  return true;
}
