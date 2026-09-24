/**
 * Wipe all products and refill from the pasted markdown catalog.
 *
 * Usage:
 *   npx tsx scripts/reseed-catalog-from-md.ts
 *   npx tsx scripts/reseed-catalog-from-md.ts --dry-run
 *   npx tsx scripts/reseed-catalog-from-md.ts --file ./data/product-catalog-source.md
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { config } from "dotenv";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database, SellingUnit } from "../src/types/database";
import { slugify } from "../src/lib/admin/slug";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient<Database>(url, key);

const CATEGORY_MAP: Record<string, { slug: string; title: string }> = {
  SWEETS: { slug: "sweets", title: "Sweets" },
  SWEET: { slug: "sweets", title: "Sweets" },
  NAMKEEN: { slug: "namkeen", title: "Namkeen" },
  "TEA TIME BITES": { slug: "tea-time-bites", title: "Tea Time Bites" },
  "TEA-TIME BITES": { slug: "tea-time-bites", title: "Tea Time Bites" },
  "DRY CAKES": { slug: "dry-cakes", title: "Dry Cakes" },
  COOKIES: { slug: "cookies", title: "Cookies" },
  GAJAK: { slug: "gajak", title: "Gajak" },
  GIFTING: { slug: "gifting", title: "Gifting" },
  GIFTS: { slug: "gifting", title: "Gifting" },
};

const SUBCATEGORY_SLUGS: Record<string, string> = {
  "DRYFRUIT SWEETS": "dryfruit-sweets",
  "WINTER SPECIAL": "winter-special",
  SEV: "sev",
  MIXTURE: "mixture",
  TIMEPASS: "timepass",
  FALAHAARI: "falahaari",
  MATHRI: "mathri",
  SEASONAL: "seasonal",
};

const VARIANT_META: Record<
  string,
  { label: string; sellingUnit: SellingUnit; quantityValue: number | null; sortOrder: number }
> = {
  "250GM": { label: "250 GM", sellingUnit: "g", quantityValue: 250, sortOrder: 0 },
  "500GM": { label: "500 GM", sellingUnit: "g", quantityValue: 500, sortOrder: 1 },
  "1KG": { label: "1 KG", sellingUnit: "kg", quantityValue: 1, sortOrder: 2 },
  PACK: { label: "PACK", sellingUnit: "pack", quantityValue: null, sortOrder: 3 },
  PC: { label: "PC", sellingUnit: "pc", quantityValue: null, sortOrder: 4 },
  PCS: { label: "PC", sellingUnit: "pc", quantityValue: null, sortOrder: 4 },
};

type ParsedVariant = {
  unitKey: string;
  label: string;
  sellingUnit: SellingUnit;
  quantityValue: number | null;
  pricePaise: number;
  sortOrder: number;
};

type ParsedProduct = {
  categoryTitle: string;
  subcategoryTitle: string | null;
  sourceName: string;
  variants: ParsedVariant[];
};

function parsePriceToken(raw: string): number | null {
  const cleaned = raw.trim();
  if (!cleaned || cleaned === "—" || cleaned === "-" || cleaned === "–") return null;
  const n = Number(cleaned.replace(/[₹,\s]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

function normalizeUnit(raw: string): string | null {
  const u = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (u === "250GM" || u === "250G") return "250GM";
  if (u === "500GM" || u === "500G") return "500GM";
  if (u === "1KG" || u === "1KG.") return "1KG";
  if (u === "PACK") return "PACK";
  if (u === "PC" || u === "PCS") return u === "PCS" ? "PCS" : "PC";
  return null;
}

function parseMarkdownCatalog(md: string): ParsedProduct[] {
  const lines = md.split(/\r?\n/);
  const products: ParsedProduct[] = [];

  let category = "";
  let subcategory: string | null = null;
  let current: ParsedProduct | null = null;
  let giftUnit: string | null = null;

  const flush = () => {
    if (current) {
      products.push(current);
      current = null;
    }
    giftUnit = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^#+\s*SUMMARY\b/i.test(trimmed) || /^##\s*Product Counts/i.test(trimmed)) {
      flush();
      break;
    }

    const catMatch = trimmed.match(/^#{2,3}\s*Category:\s*(.+)$/i);
    if (catMatch) {
      flush();
      category = catMatch[1].trim().toUpperCase();
      subcategory = null;
      continue;
    }

    const subMatch = trimmed.match(/^#{2,3}\s*Subcategory:\s*(.+)$/i);
    if (subMatch) {
      subcategory = subMatch[1].trim().toUpperCase();
      continue;
    }

    // Skip section headers like "# 3. BAKERY" / "## 1. SWEETS"
    if (/^#+\s*\d+\.\s+/i.test(trimmed) && !/Category:/i.test(trimmed)) {
      continue;
    }

    const nameMatch = trimmed.match(/^\d+\.\s+\*\*(.+?)\*\*\s*$/);
    if (nameMatch) {
      flush();
      if (!category) {
        console.warn(`Product without category: ${nameMatch[1]}`);
        continue;
      }
      current = {
        categoryTitle: category,
        subcategoryTitle: subcategory,
        sourceName: nameMatch[1].trim(),
        variants: [],
      };
      continue;
    }

    if (!current) continue;

    // Gifting style: Unit: PACK / Price: ₹1,350
    const unitOnly = trimmed.match(/^-\s*Unit:\s*(.+)$/i);
    if (unitOnly) {
      giftUnit = normalizeUnit(unitOnly[1]) ?? unitOnly[1].trim().toUpperCase();
      continue;
    }

    const priceOnly = trimmed.match(/^-\s*Price:\s*(.+)$/i);
    if (priceOnly && giftUnit) {
      const pricePaise = parsePriceToken(priceOnly[1]);
      const meta = VARIANT_META[giftUnit];
      if (pricePaise != null && meta) {
        current.variants.push({
          unitKey: giftUnit,
          ...meta,
          pricePaise,
        });
      }
      giftUnit = null;
      continue;
    }

    // Standard: - 250GM: ₹375
    const varMatch = trimmed.match(/^-\s*([A-Za-z0-9]+)\s*:\s*(.+)$/);
    if (varMatch) {
      const unitKey = normalizeUnit(varMatch[1]);
      if (!unitKey) continue;
      const pricePaise = parsePriceToken(varMatch[2]);
      if (pricePaise == null) continue;
      const meta = VARIANT_META[unitKey];
      if (!meta) continue;
      // Prefer PC over PCS if both somehow appear; skip duplicate unit keys
      if (current.variants.some((v) => v.label === meta.label)) continue;
      current.variants.push({
        unitKey,
        ...meta,
        pricePaise,
      });
    }
  }

  flush();
  return products;
}

async function wipeProducts() {
  // Clear cart lines that reference variants (cascade also covers this, but be explicit)
  const { error: cartErr } = await supabase.from("cart_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (cartErr) console.warn("cart_items wipe:", cartErr.message);

  // Null combo product/variant refs (also SET NULL on delete)
  const { error: comboErr } = await supabase
    .from("combo_items")
    .update({ product_id: null, variant_id: null })
    .not("product_id", "is", null);
  if (comboErr) console.warn("combo_items clear:", comboErr.message);

  // inventory_logs / product_images / product_attribute_values / variants cascade from products
  const { error, count } = await supabase
    .from("products")
    .delete({ count: "exact" })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) throw error;
  console.log(`Deleted products: ${count ?? "?"}`);
}

async function ensureCategory(slug: string, title: string) {
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("categories")
    .insert({ slug, title, published: true })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function ensureSubcategory(categoryId: string, title: string) {
  const normalized = title.trim().toUpperCase();
  const slug = SUBCATEGORY_SLUGS[normalized] ?? (slugify(title) || "subcategory");

  const { data: existing } = await supabase
    .from("subcategories")
    .select("id")
    .eq("category_id", categoryId)
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("subcategories")
    .insert({
      category_id: categoryId,
      slug,
      title: title
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      published: true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function uniqueProductSlug(base: string): Promise<string> {
  let candidate = slugify(base) || "product";
  let n = 2;
  for (;;) {
    const { data } = await supabase.from("products").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${slugify(base) || "product"}-${n}`;
    n += 1;
  }
}

async function uniqueSku(productSlug: string, unitKey: string): Promise<string> {
  const base = `JJ-${slugify(productSlug)}-${slugify(unitKey)}`.toUpperCase();
  let candidate = base;
  let n = 2;
  for (;;) {
    const { data } = await supabase
      .from("product_variants")
      .select("id")
      .eq("sku", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

async function importProducts(rows: ParsedProduct[], dryRun: boolean) {
  let productsCreated = 0;
  let variantsCreated = 0;
  let skipped = 0;

  for (const row of rows) {
    const catMeta = CATEGORY_MAP[row.categoryTitle];
    if (!catMeta) {
      console.warn(`Skip unknown category: ${row.categoryTitle} (${row.sourceName})`);
      skipped += 1;
      continue;
    }
    if (row.variants.length === 0) {
      console.warn(`Skip no variants: ${row.sourceName}`);
      skipped += 1;
      continue;
    }

    if (dryRun) {
      productsCreated += 1;
      variantsCreated += row.variants.length;
      continue;
    }

    const categoryId = await ensureCategory(catMeta.slug, catMeta.title);
    const subcategoryId = row.subcategoryTitle
      ? await ensureSubcategory(categoryId, row.subcategoryTitle)
      : null;

    const displayName = row.sourceName.trim().replace(/\s{2,}/g, " ");
    const productSlug = await uniqueProductSlug(displayName);

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        slug: productSlug,
        name: displayName,
        source_name: row.sourceName,
        description: "",
        category_id: categoryId,
        subcategory_id: subcategoryId,
        published: true,
        seasonal:
          row.subcategoryTitle?.toUpperCase().includes("WINTER") ||
          row.subcategoryTitle?.toUpperCase() === "SEASONAL",
      })
      .select("id")
      .single();

    if (error || !product) {
      console.error(`Failed product ${displayName}:`, error?.message);
      skipped += 1;
      continue;
    }
    productsCreated += 1;

    for (const v of row.variants) {
      const unitKey = v.quantityValue ? `${v.quantityValue}${v.sellingUnit}` : v.sellingUnit;
      const sku = await uniqueSku(productSlug, unitKey);
      const weightG =
        v.sellingUnit === "g" && v.quantityValue
          ? Math.round(v.quantityValue)
          : v.sellingUnit === "kg" && v.quantityValue
            ? Math.round(v.quantityValue * 1000)
            : null;

      const { error: vErr } = await supabase.from("product_variants").insert({
        product_id: product.id,
        label: v.label,
        sku,
        price_paise: v.pricePaise,
        selling_unit: v.sellingUnit,
        quantity_value: v.quantityValue,
        weight_g: weightG,
        stock_qty: 0,
        available: true,
        sort_order: v.sortOrder,
      });

      if (vErr) {
        console.error(`  variant error ${displayName} ${v.label}:`, vErr.message);
      } else {
        variantsCreated += 1;
      }
    }
  }

  return { productsCreated, variantsCreated, skipped };
}

function writeCsvFixture(rows: ParsedProduct[], outPath: string) {
  const header = ["Category", "Subcategory", "Name", "250GM", "500GM", "1KG", "PACK", "PC", "PCS"];
  const lines = [header.join(",")];
  for (const row of rows) {
    const price = (key: string) => {
      const v = row.variants.find((x) => x.unitKey === key);
      return v ? String(v.pricePaise / 100) : "";
    };
    const cells = [
      row.categoryTitle,
      row.subcategoryTitle ?? "",
      `"${row.sourceName.replace(/"/g, '""')}"`,
      price("250GM"),
      price("500GM"),
      price("1KG"),
      price("PACK"),
      price("PC"),
      price("PCS"),
    ];
    lines.push(cells.join(","));
  }
  writeFileSync(outPath, lines.join("\n"), "utf8");
}

async function verify() {
  const { data: cats } = await supabase.from("categories").select("id, slug, title");
  const { data: products } = await supabase
    .from("products")
    .select("id, name, source_name, category_id, subcategory_id");
  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, product_id, label, price_paise, sku");

  const bySlug = new Map((cats ?? []).map((c) => [c.id, c.slug]));
  const counts: Record<string, number> = {};
  for (const p of products ?? []) {
    const slug = bySlug.get(p.category_id ?? "") ?? "unknown";
    counts[slug] = (counts[slug] ?? 0) + 1;
  }

  const bakery =
    (counts["tea-time-bites"] ?? 0) + (counts["dry-cakes"] ?? 0) + (counts["cookies"] ?? 0);

  console.log("\n=== Verification ===");
  console.log("Total products:", products?.length ?? 0);
  console.log("Total variants:", variants?.length ?? 0);
  console.log("By category:", counts);
  console.log("Bakery group (tea-time + dry-cakes + cookies):", bakery);
  console.log("Expected: sweets=32 namkeen=74 bakery=31 gajak=17 gifting=26 total=180");

  const spot = async (name: string, label: string, expected: number) => {
    const prod = (products ?? []).find(
      (p) => p.source_name === name || p.name.toUpperCase() === name,
    );
    if (!prod) {
      console.log(`SPOT FAIL: missing ${name}`);
      return;
    }
    const v = (variants ?? []).find((x) => x.product_id === prod.id && x.label === label);
    if (!v) {
      console.log(`SPOT FAIL: ${name} missing variant ${label}`);
      return;
    }
    const ok = v.price_paise === expected;
    console.log(
      `SPOT ${ok ? "OK" : "FAIL"}: ${name} ${label} = ${v.price_paise} (expected ${expected})`,
    );
  };

  await spot("KAJU KATLI", "250 GM", 37500);
  await spot("CORNFLAKES MIX (200GM)", "PACK", 11200);
  await spot("CHATORA (70GM)", "PACK", 5000);
  await spot("MUFFINS", "PC", 3000);
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const fileIdx = argv.indexOf("--file");
  const file =
    fileIdx >= 0
      ? argv[fileIdx + 1]
      : resolve(process.cwd(), "data/product-catalog-source.md");

  const md = readFileSync(file, "utf8");
  const rows = parseMarkdownCatalog(md);
  console.log(`Parsed ${rows.length} products from ${file}`);

  const byCat: Record<string, number> = {};
  for (const r of rows) {
    byCat[r.categoryTitle] = (byCat[r.categoryTitle] ?? 0) + 1;
  }
  console.log("Parsed by category:", byCat);

  const noVar = rows.filter((r) => r.variants.length === 0);
  if (noVar.length) {
    console.warn(
      "Products with zero priced variants:",
      noVar.map((r) => r.sourceName).join(", "),
    );
  }

  const csvPath = resolve(process.cwd(), "data/catalog-import.csv");
  writeCsvFixture(rows, csvPath);
  console.log(`Wrote fixture ${csvPath}`);

  if (dryRun) {
    const result = await importProducts(rows, true);
    console.log("DRY RUN", result);
    return;
  }

  console.log("Wiping products…");
  await wipeProducts();

  console.log("Importing…");
  const result = await importProducts(rows, false);
  console.log("Import result:", result);

  await verify();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
