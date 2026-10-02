/**
 * Delete catalog products whose names are not in jaijinendra_products.json.
 *
 * Usage:
 *   npx tsx scripts/remove-products-absent-from-json.ts
 *   npx tsx scripts/remove-products-absent-from-json.ts --apply
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
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

function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toUpperCase();
}

function collectNames(raw: unknown): Set<string> {
  const names = new Set<string>();
  if (!raw || typeof raw !== "object") return names;
  for (const rows of Object.values(raw as Record<string, unknown>)) {
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const name = (row as { item_name?: unknown }).item_name;
      if (typeof name === "string" && name.trim()) names.add(normalizeName(name));
    }
  }
  return names;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const file = resolve(process.cwd(), "jaijinendra_products.json");
  const names = collectNames(JSON.parse(readFileSync(file, "utf8")));
  console.log(`JSON item names: ${names.size}`);

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, source_name, slug, published, categories(slug, title)")
    .order("name");
  if (error) throw new Error(error.message);

  const keep: { name: string; category: string }[] = [];
  const remove: { id: string; name: string; slug: string; category: string }[] = [];

  for (const product of products ?? []) {
    const category = Array.isArray(product.categories)
      ? product.categories[0]
      : product.categories;
    const categoryLabel = category?.slug ?? "uncategorized";
    const candidates = [product.source_name, product.name].filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    );
    const matched = candidates.some((value) => names.has(normalizeName(value)));
    if (matched) {
      keep.push({ name: product.source_name || product.name, category: categoryLabel });
    } else {
      remove.push({
        id: product.id,
        name: product.source_name || product.name,
        slug: product.slug,
        category: categoryLabel,
      });
    }
  }

  const byCategory = new Map<string, number>();
  for (const row of remove) {
    byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + 1);
  }

  console.log(`DB products: ${(products ?? []).length}`);
  console.log(`Keep: ${keep.length}`);
  console.log(`Remove: ${remove.length}`);
  console.log("Remove by category:");
  for (const [slug, count] of [...byCategory.entries()].sort()) {
    console.log(`  ${slug}: ${count}`);
  }
  for (const row of remove) {
    console.log(`  - [${row.category}] ${row.name} (${row.slug})`);
  }

  if (!apply) {
    console.log("\nDry run. Re-run with --apply to delete these products.");
    return;
  }
  if (!remove.length) {
    console.log("Nothing to delete.");
    return;
  }

  const ids = remove.map((row) => row.id);
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const { error: deleteError } = await supabase.from("products").delete().in("id", chunk);
    if (deleteError) throw new Error(deleteError.message);
  }
  console.log(`Deleted ${ids.length} products.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
