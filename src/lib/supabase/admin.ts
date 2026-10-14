import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getEnv } from "@/lib/env";

let adminClient: SupabaseClient<Database> | null = null;

/**
 * Service-role client. It holds no session, so one instance per server
 * process is safe and reuses its HTTP keep-alive connections.
 */
export function createAdminClient() {
  if (adminClient) return adminClient;
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL", true)!;
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY", true)!;
  adminClient = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}
