/**
 * Remove categories and subcategories that are not in jaijinendra_products.json.
 *
 * Gajak products currently stored under Sweets are moved onto the Gajak category
 * and its Seasonal subcategory, which are the taxonomy in the JSON.
 *
 * Usage:
 *   npx tsx scripts/remove-taxonomy-absent-from-json.ts
 *   npx tsx scripts/remove-taxonomy-absent-from-json.ts --apply
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const KEEP_CATEGORY_SLUGS = new Set([
  "namkeen",
  "tea-time-bites",
  "dry-cakes",
  "cookies",
  "gajak",
  "gifting",
]);

const KEEP_SUBCATEGORIES = new Set([
  "namkeen/sev",
  "namkeen/mixture",
  "namkeen/timepass",
  "namkeen/falahaari",
  "namkeen/mathri",
  "gajak/seasonal",
]);

type CategoryRow = { id: string; slug: string; title: string; published: boolean };
type SubcategoryRow = {
  id: string;
  slug: string;
  title: string;
  category_id: string;
  published: boolean;
};

async function main() {
  const apply = process.argv.includes("--apply");
  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .select("id, slug, title, published");
  if (categoryError) throw new Error(categoryError.message);
  const { data: subcategories, error: subcategoryError } = await supabase
    .from("subcategories")
    .select("id, slug, title, category_id, published");
  if (subcategoryError) throw new Error(subcategoryError.message);

  const categoryRows = (categories ?? []) as CategoryRow[];
  const subcategoryRows = (subcategories ?? []) as SubcategoryRow[];
  const categoryById = new Map(categoryRows.map((row) => [row.id, row]));
  const gajak = categoryRows.find((row) => row.slug === "gajak");
  const seasonal = subcategoryRows.find((row) => {
    const parent = categoryById.get(row.category_id);
    return parent?.slug === "gajak" && row.slug === "seasonal";
  });
  const sweetsGajak = subcategoryRows.find((row) => {
    const parent = categoryById.get(row.category_id);
    return parent?.slug === "sweets" && row.slug === "gajak";
  });
  if (!gajak || !seasonal) {
    throw new Error("Expected the gajak category and gajak/seasonal subcategory to exist.");
  }

  const { data: movedProducts, error: movedError } = await supabase
    .from("products")
    .select("id, name")
    .eq("subcategory_id", sweetsGajak?.id ?? "00000000-0000-0000-0000-000000000000");
  if (movedError) throw new Error(movedError.message);

  const categoryDeletes = categoryRows.filter((row) => !KEEP_CATEGORY_SLUGS.has(row.slug));
  const subcategoryDeletes = subcategoryRows.filter((row) => {
    const parent = categoryById.get(row.category_id);
    if (!parent || !KEEP_CATEGORY_SLUGS.has(parent.slug)) return false;
    return !KEEP_SUBCATEGORIES.has(`${parent.slug}/${row.slug}`);
  });

  console.log(`Move to gajak/seasonal: ${(movedProducts ?? []).length}`);
  for (const product of movedProducts ?? []) console.log(`  - ${product.name}`);
  console.log(`Unpublish/delete categories: ${categoryDeletes.length}`);
  for (const row of categoryDeletes) console.log(`  - ${row.slug} (${row.title})`);
  console.log(`Delete extra kept-category subcategories: ${subcategoryDeletes.length}`);
  for (const row of subcategoryDeletes) {
    const parent = categoryById.get(row.category_id);
    console.log(`  - ${parent?.slug}/${row.slug} (${row.title})`);
  }

  if (!apply) {
    console.log("\nDry run. Re-run with --apply to update the database.");
    return;
  }

  if ((movedProducts ?? []).length) {
    const { error } = await supabase
      .from("products")
      .update({ category_id: gajak.id, subcategory_id: seasonal.id })
      .in(
        "id",
        (movedProducts ?? []).map((product) => product.id),
      );
    if (error) throw new Error(error.message);
  }

  if (!gajak.published) {
    const { error } = await supabase.from("categories").update({ published: true }).eq("id", gajak.id);
    if (error) throw new Error(error.message);
  }

  if (subcategoryDeletes.length) {
    const { error } = await supabase
      .from("subcategories")
      .delete()
      .in(
        "id",
        subcategoryDeletes.map((row) => row.id),
      );
    if (error) throw new Error(error.message);
  }

  if (categoryDeletes.length) {
    const { error } = await supabase
      .from("categories")
      .delete()
      .in(
        "id",
        categoryDeletes.map((row) => row.id),
      );
    if (error) throw new Error(error.message);
  }

  console.log("Taxonomy updated.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
