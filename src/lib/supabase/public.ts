import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey } from "@/lib/env";

let publicClient: SupabaseClient<Database> | null = null;

/**
 * Cookieless anon-key client for public, cacheable storefront reads.
 * RLS still applies (same role as a logged-out visitor), and it is safe inside
 * unstable_cache, which cannot read request cookies. Sessionless, so a single
 * shared instance is safe.
 */
export function createPublicClient() {
  publicClient ??= createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabaseAnonKey(),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  return publicClient;
}
