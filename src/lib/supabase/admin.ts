import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getEnv } from "@/lib/env";

export function createAdminClient() {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL", true)!;
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY", true)!;
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
