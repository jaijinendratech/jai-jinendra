/**
 * Excel catalog import (additive — does not delete existing products).
 *
 * Usage:
 *   npm install xlsx          # one-time, not bundled in app
 *   npx tsx scripts/import-catalog.ts --file ./data/catalog.xlsx
 *   npx tsx scripts/import-catalog.ts --file ./data/catalog.xlsx --dry-run
 *   npx tsx scripts/import-catalog.ts --file ./data/catalog.xlsx --sheet "SWEETS"
 *
 * Expected columns (case-insensitive header match):
 *   Category | Subcategory | Name | 250GM | 500GM | 1KG | PACK | PC | PCS
 *
 * Rules:
 *   - Blank subcategory → carry forward last non-blank within sheet
 *   - Price cell 0 or empty → skip variant (not created)
 *   - Stock defaults to 0 on all imported variants
 *   - source_name preserves exact Excel name; name is trimmed display copy
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import type { Database, SellingUnit } from "../src/types/database";
import { slugify } from "../src/lib/admin/slug";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient<Database>(url, key);

type Args = {
  file: string;
  dryRun: boolean;
  sheet?: string;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  let file = "";
  let dryRun = false;
  let sheet: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--file") file = argv[++i] ?? "";
    else if (arg === "--sheet") sheet = argv[++i];
  }

  if (!file) {
    console.error("Usage: npx tsx scripts/import-catalog.ts --file <path.xlsx> [--dry-run] [--sheet NAME]");
    process.exit(1);
  }

  return { file, dryRun, sheet };
}

/** Map Excel family / category column → DB category slug (Section S). */
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

type VariantColumn = {
  header: string;
  label: string;
  sellingUnit: SellingUnit;
  quantityValue: number | null;
  sortOrder: number;
};

const VARIANT_COLUMNS: VariantColumn[] = [
  { header: "250GM", label: "250 GM", sellingUnit: "g", quantityValue: 250, sortOrder: 0 },
  { header: "250 GM", label: "250 GM", sellingUnit: "g", quantityValue: 250, sortOrder: 0 },
  { header: "500GM", label: "500 GM", sellingUnit: "g", quantityValue: 500, sortOrder: 1 },
  { header: "500 GM", label: "500 GM", sellingUnit: "g", quantityValue: 500, sortOrder: 1 },
  { header: "1KG", label: "1 KG", sellingUnit: "kg", quantityValue: 1, sortOrder: 2 },
  { header: "1 KG", label: "1 KG", sellingUnit: "kg", quantityValue: 1, sortOrder: 2 },
  { header: "PACK", label: "PACK", sellingUnit: "pack", quantityValue: null, sortOrder: 3 },
  { header: "PC", label: "PC", sellingUnit: "pc", quantityValue: null, sortOrder: 4 },
  { header: "PCS", label: "PC", sellingUnit: "pc", quantityValue: null, sortOrder: 4 },
];

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function parsePrice(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(/[₹,\s]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

function trimDisplayName(raw: string): string {
  return raw.trim().replace(/\s{2,}/g, " ");
}

async function ensureCategory(slug: string, title: string, dryRun: boolean) {
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return existing.id;

  if (dryRun) {
    console.log(`[dry-run] would create category ${slug}`);
    return `dry-${slug}`;
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ slug, title, published: true })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function ensureSubcategory(
  categoryId: string,
  title: string,
  dryRun: boolean,
): Promise<string | null> {
  const normalized = title.trim().toUpperCase();
  if (!normalized) return null;

  const slug =
    SUBCATEGORY_SLUGS[normalized] ?? slugify(title) || "subcategory";

  const { data: existing } = await supabase
    .from("subcategories")
    .select("id")
    .eq("category_id", categoryId)
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return existing.id;

  if (dryRun) {
    console.log(`[dry-run] would create subcategory ${slug} under ${categoryId}`);
    return `dry-sub-${slug}`;
  }

  const { data, error } = await supabase
    .from("subcategories")
    .insert({
      category_id: categoryId,
      slug,
      title: trimDisplayName(title),
      published: true,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function uniqueProductSlug(base: string, dryRun: boolean): Promise<string> {
  let candidate = slugify(base) || "product";
  let n = 2;
  for (;;) {
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${slugify(base) || "product"}-${n}`;
    n += 1;
    if (dryRun && n > 5) return candidate;
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

type ImportRow = {
  categoryTitle: string;
  subcategoryTitle: string | null;
  sourceName: string;
  variants: {
    label: string;
    sellingUnit: SellingUnit;
    quantityValue: number | null;
    pricePaise: number;
    sortOrder: number;
  }[];
};

function sheetToRows(matrix: unknown[][]): ImportRow[] {
  if (!matrix.length) return [];

  const headers = matrix[0].map(normalizeHeader);
  const colIndex = (name: string) => headers.indexOf(normalizeHeader(name));

  const categoryCol = colIndex("CATEGORY");
  const subcategoryCol = colIndex("SUBCATEGORY");
  const nameCol = colIndex("NAME");
  if (categoryCol < 0 || nameCol < 0) {
    throw new Error("Sheet must include Category and Name columns.");
  }

  const variantCols = VARIANT_COLUMNS.map((vc) => ({
    ...vc,
    index: headers.findIndex((h) => h === normalizeHeader(vc.header)),
  })).filter((vc) => vc.index >= 0);

  const rows: ImportRow[] = [];
  let carrySubcategory = "";

  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r];
    const categoryRaw = normalizeHeader(row[categoryCol]);
    const nameRaw = String(row[nameCol] ?? "").trim();
    if (!nameRaw) continue;

    const subRaw = subcategoryCol >= 0 ? String(row[subcategoryCol] ?? "").trim() : "";
    if (subRaw) carrySubcategory = subRaw;

    const variants: ImportRow["variants"] = [];
    for (const vc of variantCols) {
      const pricePaise = parsePrice(row[vc.index]);
      if (pricePaise == null) continue;
      variants.push({
        label: vc.label,
        sellingUnit: vc.sellingUnit,
        quantityValue: vc.quantityValue,
        pricePaise,
        sortOrder: vc.sortOrder,
      });
    }

    rows.push({
      categoryTitle: categoryRaw,
      subcategoryTitle: carrySubcategory || null,
      sourceName: nameRaw,
      variants,
    });
  }

  return rows;
}

async function importRows(rows: ImportRow[], dryRun: boolean) {
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
      console.warn(`Skip no variants (all zero): ${row.sourceName}`);
      skipped += 1;
      continue;
    }

    const categoryId = await ensureCategory(catMeta.slug, catMeta.title, dryRun);
    const subcategoryId = row.subcategoryTitle
      ? await ensureSubcategory(categoryId, row.subcategoryTitle, dryRun)
      : null;

    const displayName = trimDisplayName(row.sourceName);
    const productSlug = await uniqueProductSlug(displayName, dryRun);

    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("source_name", row.sourceName)
      .eq("category_id", categoryId)
      .maybeSingle();

    let productId = existingProduct?.id;

    if (!productId) {
      if (dryRun) {
        console.log(`[dry-run] product ${displayName} (${productSlug})`);
        productId = `dry-${productSlug}`;
        productsCreated += 1;
      } else {
        const { data, error } = await supabase
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
        if (error) {
          console.error(`Failed product ${displayName}:`, error.message);
          skipped += 1;
          continue;
        }
        productId = data.id;
        productsCreated += 1;
      }
    }

    for (const v of row.variants) {
      const unitKey = v.quantityValue
        ? `${v.quantityValue}${v.sellingUnit}`
        : v.sellingUnit;
      const sku = await uniqueSku(productSlug, unitKey);

      if (dryRun) {
        console.log(
          `  [dry-run] variant ${v.label} ₹${v.pricePaise / 100} sku=${sku}`,
        );
        variantsCreated += 1;
        continue;
      }

      const weightG =
        v.sellingUnit === "g" && v.quantityValue
          ? Math.round(v.quantityValue)
          : v.sellingUnit === "kg" && v.quantityValue
            ? Math.round(v.quantityValue * 1000)
            : null;

      const { error } = await supabase.from("product_variants").upsert(
        {
          product_id: productId!,
          label: v.label,
          sku,
          price_paise: v.pricePaise,
          selling_unit: v.sellingUnit,
          quantity_value: v.quantityValue,
          weight_g: weightG,
          stock_qty: 0,
          available: true,
          sort_order: v.sortOrder,
        },
        { onConflict: "sku", ignoreDuplicates: true },
      );

      if (error) {
        console.error(`  variant error ${v.label}:`, error.message);
      } else {
        variantsCreated += 1;
      }
    }
  }

  return { productsCreated, variantsCreated, skipped };
}

async function main() {
  const { file, dryRun, sheet } = parseArgs();

  let XLSX: typeof import("xlsx");
  try {
    XLSX = await import("xlsx");
  } catch {
    console.error("Missing dependency: run `npm install xlsx` then retry.");
    process.exit(1);
  }

  const workbook = XLSX.read(readFileSync(file), { type: "buffer" });
  const sheetNames = sheet ? [sheet] : workbook.SheetNames;

  console.log(
    `${dryRun ? "DRY RUN" : "IMPORT"} · ${basename(file)} · sheets: ${sheetNames.join(", ")}`,
  );

  let totalProducts = 0;
  let totalVariants = 0;
  let totalSkipped = 0;

  for (const sheetName of sheetNames) {
    const ws = workbook.Sheets[sheetName];
    if (!ws) {
      console.warn(`Sheet not found: ${sheetName}`);
      continue;
    }
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, {
      header: 1,
      defval: "",
    });
    const rows = sheetToRows(matrix);
    console.log(`Sheet "${sheetName}": ${rows.length} product rows`);
    const result = await importRows(rows, dryRun);
    totalProducts += result.productsCreated;
    totalVariants += result.variantsCreated;
    totalSkipped += result.skipped;
  }

  console.log(
    `Done. products=${totalProducts} variants=${totalVariants} skipped=${totalSkipped}${dryRun ? " (no writes)" : ""}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
