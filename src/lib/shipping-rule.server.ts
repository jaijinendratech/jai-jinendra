import { isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_SHIPPING_RULE,
  parseShippingRule,
  type ShippingRule,
} from "@/lib/shipping-rule";

/**
 * Current shipping rule. Deliberately uncached: cart, coupon preview and order
 * creation must all charge the same amount, and an admin edit applies at once.
 */
export async function getShippingRule(): Promise<ShippingRule> {
  if (!isSupabaseConfigured()) return DEFAULT_SHIPPING_RULE;
  try {
    const { data } = await createAdminClient()
      .from("content_blocks")
      .select("content")
      .eq("page_key", "store")
      .eq("section_key", "shipping")
      .maybeSingle();
    return parseShippingRule(data?.content);
  } catch {
    return DEFAULT_SHIPPING_RULE;
  }
}
