/**
 * Seed canonical categories + subcategories for the Excel catalog architecture.
 * Additive upsert by slug — does not remove legacy demo categories.
 *
 * Usage: npx tsx scripts/seed-canonical-taxonomy.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient<Database>(url, key);

const CATEGORIES = [
  { slug: "sweets", title: "Sweets", subtitle: "Dryfruit mithai & festive classics", sort_order: 10, featured: true },
  { slug: "namkeen", title: "Namkeen", subtitle: "Sev, mixtures & timepass crunch", sort_order: 20, featured: true },
  { slug: "tea-time-bites", title: "Tea Time Bites", subtitle: "Khari, toast & chai companions", sort_order: 30, featured: false },
  { slug: "dry-cakes", title: "Dry Cakes", subtitle: "Muffins, brownies & slice cakes", sort_order: 40, featured: false },
  { slug: "cookies", title: "Cookies", subtitle: "Heritage cookies by weight", sort_order: 50, featured: false },
  { slug: "gajak", title: "Gajak", subtitle: "Seasonal chikki & gajak specialties", sort_order: 60, featured: false },
  { slug: "gifting", title: "Gifting", subtitle: "Dryfruit trays, boxes & hampers", sort_order: 70, featured: true },
] as const;

const SUBCATEGORIES: Record<string, { slug: string; title: string; sort_order: number }[]> = {
  sweets: [
    { slug: "dryfruit-sweets", title: "Dryfruit Sweets", sort_order: 0 },
    { slug: "winter-special", title: "Winter Special", sort_order: 1 },
  ],
  namkeen: [
    { slug: "sev", title: "Sev", sort_order: 0 },
    { slug: "mixture", title: "Mixture", sort_order: 1 },
    { slug: "timepass", title: "Timepass", sort_order: 2 },
    { slug: "falahaari", title: "Falahaari", sort_order: 3 },
    { slug: "mathri", title: "Mathri", sort_order: 4 },
  ],
  gajak: [{ slug: "seasonal", title: "Seasonal", sort_order: 0 }],
};

async function main() {
  for (const cat of CATEGORIES) {
    const { data, error } = await supabase
      .from("categories")
      .upsert(
        {
          slug: cat.slug,
          title: cat.title,
          subtitle: cat.subtitle,
          sort_order: cat.sort_order,
          published: true,
          featured: cat.featured,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" },
      )
      .select("id, slug")
      .single();

    if (error || !data) {
      console.error("Category failed:", cat.slug, error);
      process.exit(1);
    }
    console.log(`category ${data.slug}`);

    const subs = SUBCATEGORIES[cat.slug] ?? [];
    for (const sub of subs) {
      const { error: subErr } = await supabase.from("subcategories").upsert(
        {
          category_id: data.id,
          slug: sub.slug,
          title: sub.title,
          sort_order: sub.sort_order,
          published: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "category_id,slug" },
      );
      if (subErr) {
        console.error("Subcategory failed:", cat.slug, sub.slug, subErr);
        process.exit(1);
      }
      console.log(`  subcategory ${sub.slug}`);
    }
  }

  console.log("Canonical taxonomy seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
