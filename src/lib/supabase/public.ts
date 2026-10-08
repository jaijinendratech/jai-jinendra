import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey } from "@/lib/env";

/**
 * Cookieless anon-key client for public, cacheable storefront reads.
 * RLS still applies (same role as a logged-out visitor), and it is safe inside
 * unstable_cache, which cannot read request cookies.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabaseAnonKey(),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
