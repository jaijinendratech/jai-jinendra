/**
 * Non-destructive sync of the live catalog from jaijinendra_products.json.
 *
 * Updates prices, inserts missing variants, and sets available=false on
 * variants that should not exist. Never deletes products or variants.
 *
 * Usage:
 *   npx tsx scripts/sync-catalog-from-json.ts --dry-run
 *   npx tsx scripts/sync-catalog-from-json.ts
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
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

const BAKERY_CATEGORY: Record<string, string> = {
  "TEA TIME BITES": "tea-time-bites",
  "DRY CAKES": "dry-cakes",
  COOKIES: "cookies",
};

/** Products in these categories are unpublished when absent from the JSON. Sweets is left alone. */
const UNPUBLISH_PRODUCT_CATEGORIES = new Set([
  "namkeen",
  "tea-time-bites",
  "dry-cakes",
  "cookies",
  "gifting",
]);

const LEGACY_CATEGORY_SLUGS = [
  "namkeens",
  "khasta-kachori-samosa",
  "mithai",
  "gifts",
  "tea-time",
  "dry-fruits",
];

type DesiredVariant = {
  unitKey: string;
  label: string;
  sellingUnit: SellingUnit;
  quantityValue: number | null;
  pricePaise: number;
  sortOrder: number;
};

type ParsedProduct = {
  categorySlug: string;
  sourceName: string;
  variants: DesiredVariant[];
};

type WeightRow = {
  category?: string;
  sub_category?: string | null;
  item_name: string;
  price_250gm?: number | null;
  price_500gm?: number | null;
  price_1kg?: number | null;
  pack_price?: number | null;
};

type GiftRow = {
  item_name: string;
  unit?: string;
  price?: number | null;
};

type CatalogFile = {
  NAMKEEN?: WeightRow[];
  BAKERY?: WeightRow[];
  GAJAK?: WeightRow[];
  GIFTING?: GiftRow[];
};

type DbCategory = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
};

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  source_name: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  published: boolean;
};

type DbVariant = {
  id: string;
  product_id: string;
  label: string;
  sku: string;
  price_paise: number;
  selling_unit: SellingUnit;
  quantity_value: number | null;
  available: boolean;
  sort_order: number;
};

type PriceUpdate = {
  productId: string;
  variantId: string;
  name: string;
  label: string;
  fromPaise: number;
  toPaise: number;
  reenable: boolean;
};

type VariantInsert = {
  productId: string;
  productSlug: string;
  name: string;
  variant: DesiredVariant;
};

type VariantDisable = {
  productId: string;
  variantId: string;
  name: string;
  label: string;
  pricePaise: number;
};

type ProductUnpublish = {
  productId: string;
  name: string;
  categorySlug: string;
};

type GajakMove = {
  productId: string;
  name: string;
  fromCategoryId: string | null;
  fromSubcategoryId: string | null;
};

function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toUpperCase();
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

function variantLabelKey(label: string): string {
  const unit = normalizeUnit(label);
  if (!unit) return label.trim().toUpperCase();
  return VARIANT_META[unit]?.label ?? label.trim().toUpperCase();
}

/** Treat null, non-finite, and 0 as absent. */
function pricePaise(value: number | null | undefined): number | null {
  if (value == null || typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return Math.round(value * 100);
}

function nameHasPackSize(name: string): boolean {
  const n = name.toUpperCase();
  return /200\s*GM\b/.test(n) || /\(\s*200\s*\)/.test(n) || /400\s*GM\b/.test(n) || /100\s*GM\b/.test(n);
}

function desiredVariant(unitKey: string, paise: number): DesiredVariant {
  const meta = VARIANT_META[unitKey];
  if (!meta) throw new Error(`Unknown unit ${unitKey}`);
  return { unitKey, ...meta, pricePaise: paise };
}

function variantsFromWeightRow(row: WeightRow): DesiredVariant[] {
  const p250 = pricePaise(row.price_250gm);
  const p500 = pricePaise(row.price_500gm);
  const p1 = pricePaise(row.price_1kg);
  const pack = pricePaise(row.pack_price);
  const weightsAbsent = p250 == null && p500 == null && p1 == null;
  const packOnly = nameHasPackSize(row.item_name) || (pack != null && weightsAbsent);

  if (packOnly) {
    return pack != null ? [desiredVariant("PACK", pack)] : [];
  }

  const variants: DesiredVariant[] = [];
  if (p250 != null) variants.push(desiredVariant("250GM", p250));
  if (p500 != null) variants.push(desiredVariant("500GM", p500));
  if (p1 != null) variants.push(desiredVariant("1KG", p1));
  return variants;
}

function parseCatalog(raw: CatalogFile): { products: ParsedProduct[]; warnings: string[] } {
  const products: ParsedProduct[] = [];
  const warnings: string[] = [];

  const walkWeight = (
    rows: WeightRow[] | undefined,
    resolveCategory: (row: WeightRow, carried: string | null) => {
      categorySlug: string;
      carried: string | null;
    } | null,
  ) => {
    let carried: string | null = null;
    for (const row of rows ?? []) {
      const name = row.item_name?.trim();
      if (!name) {
        warnings.push("Skipped weight row with empty item_name");
        continue;
      }
      if (row.sub_category != null && String(row.sub_category).trim()) {
        carried = String(row.sub_category).trim();
      }
      const resolved = resolveCategory(row, carried);
      if (!resolved) {
        warnings.push(`Skipped ${name}: could not resolve category`);
        continue;
      }
      carried = resolved.carried;
      const variants = variantsFromWeightRow(row);
      if (variants.length === 0) {
        warnings.push(`Skipped ${name}: no priced variants after pack/weight rules`);
        continue;
      }
      products.push({
        categorySlug: resolved.categorySlug,
        sourceName: name,
        variants,
      });
    }
  };

  walkWeight(raw.NAMKEEN, (_row, carried) => ({
    categorySlug: "namkeen",
    carried,
  }));

  walkWeight(raw.BAKERY, (row, carried) => {
    const key = (row.category ?? "").trim().toUpperCase();
    const categorySlug = BAKERY_CATEGORY[key];
    if (!categorySlug) return null;
    return { categorySlug, carried };
  });

  walkWeight(raw.GAJAK, (_row, carried) => ({
    categorySlug: "gajak",
    carried,
  }));

  for (const row of raw.GIFTING ?? []) {
    const name = row.item_name?.trim();
    if (!name) {
      warnings.push("Skipped gifting row with empty item_name");
      continue;
    }
    const unit = normalizeUnit(row.unit ?? "");
    const paise = pricePaise(row.price);
    if (!unit || !VARIANT_META[unit] || paise == null) {
      warnings.push(`Skipped gifting ${name}: missing unit or price`);
      continue;
    }
    products.push({
      categorySlug: "gifting",
      sourceName: name,
      variants: [desiredVariant(unit, paise)],
    });
  }

  return { products, warnings };
}

async function fetchAll<T>(
  load: (from: number, to: number) => Promise<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const pageSize = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await load(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < pageSize) break;
  }
  return rows;
}

async function loadDb() {
  const categories = await fetchAll<DbCategory>((from, to) =>
    supabase.from("categories").select("id, slug, title, published").order("id").range(from, to),
  );
  const subcategories = await fetchAll<{
    id: string;
    category_id: string;
    slug: string;
    title: string;
    sort_order: number;
  }>((from, to) =>
    supabase
      .from("subcategories")
      .select("id, category_id, slug, title, sort_order")
      .order("id")
      .range(from, to),
  );
  const products = await fetchAll<DbProduct>((from, to) =>
    supabase
      .from("products")
      .select("id, slug, name, source_name, category_id, subcategory_id, published")
      .order("id")
      .range(from, to),
  );
  const variants = await fetchAll<DbVariant>((from, to) =>
    supabase
      .from("product_variants")
      .select(
        "id, product_id, label, sku, price_paise, selling_unit, quantity_value, available, sort_order",
      )
      .order("id")
      .range(from, to),
  );
  return { categories, subcategories, products, variants };
}

function rupees(paise: number): string {
  const n = paise / 100;
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

async function uniqueSku(productSlug: string, unitKey: string): Promise<string> {
  const base = `JJ-${slugify(productSlug)}-${slugify(unitKey)}`.toUpperCase();
  let candidate = base;
  let n = 2;
  for (;;) {
    const { data, error } = await supabase
      .from("product_variants")
      .select("id")
      .eq("sku", candidate)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

function weightG(variant: DesiredVariant): number | null {
  if (variant.sellingUnit === "g" && variant.quantityValue) return Math.round(variant.quantityValue);
  if (variant.sellingUnit === "kg" && variant.quantityValue) {
    return Math.round(variant.quantityValue * 1000);
  }
  return null;
}

type Plan = {
  warnings: string[];
  parsedCounts: Record<string, number>;
  priceUpdates: PriceUpdate[];
  variantInserts: VariantInsert[];
  variantDisables: VariantDisable[];
  productUnpublishes: ProductUnpublish[];
  gajakMoves: GajakMove[];
  categoryUnpublishes: { id: string; slug: string; title: string }[];
  missingInDb: { categorySlug: string; sourceName: string }[];
  alreadyUnpublishedCategories: string[];
  gajakSubcategory: { action: "create" | "reuse" | "retitle"; title: string };
};

function buildPlan(
  parsed: ParsedProduct[],
  warnings: string[],
  db: Awaited<ReturnType<typeof loadDb>>,
): Plan {
  const categoryById = new Map(db.categories.map((c) => [c.id, c]));
  const subcategoryById = new Map(db.subcategories.map((s) => [s.id, s]));
  const productsByCategoryName = new Map<string, DbProduct[]>();

  for (const product of db.products) {
    const category = product.category_id ? categoryById.get(product.category_id) : undefined;
    if (!category) continue;
    const key = `${category.slug}::${normalizeName(product.source_name || product.name)}`;
    const list = productsByCategoryName.get(key) ?? [];
    list.push(product);
    productsByCategoryName.set(key, list);
  }

  const variantsByProduct = new Map<string, DbVariant[]>();
  for (const variant of db.variants) {
    const list = variantsByProduct.get(variant.product_id) ?? [];
    list.push(variant);
    variantsByProduct.set(variant.product_id, list);
  }

  const priceUpdates: PriceUpdate[] = [];
  const variantInserts: VariantInsert[] = [];
  const variantDisables: VariantDisable[] = [];
  const matchedProductIds = new Set<string>();
  const missingInDb: { categorySlug: string; sourceName: string }[] = [];
  const gajakMoves: GajakMove[] = [];

  const parsedCounts: Record<string, number> = {};
  for (const row of parsed) {
    parsedCounts[row.categorySlug] = (parsedCounts[row.categorySlug] ?? 0) + 1;
    const key = `${row.categorySlug}::${normalizeName(row.sourceName)}`;
    let matches = productsByCategoryName.get(key) ?? [];
    // After the move, gajak rows live under sweets / subcategory gajak.
    if (matches.length === 0 && row.categorySlug === "gajak") {
      const moved = (productsByCategoryName.get(`sweets::${normalizeName(row.sourceName)}`) ?? []).filter(
        (product) => {
          const sub = product.subcategory_id ? subcategoryById.get(product.subcategory_id) : undefined;
          return sub?.slug === "gajak";
        },
      );
      matches = moved;
    }
    if (matches.length === 0) {
      missingInDb.push({ categorySlug: row.categorySlug, sourceName: row.sourceName });
      continue;
    }
    if (matches.length > 1) {
      warnings.push(
        `Multiple DB products for ${row.categorySlug} / ${normalizeName(row.sourceName)}: ${matches
          .map((p) => p.slug)
          .join(", ")} — using ${matches[0].slug}`,
      );
    }
    const product = matches[0];
    matchedProductIds.add(product.id);

    if (row.categorySlug === "gajak") {
      gajakMoves.push({
        productId: product.id,
        name: product.source_name || product.name,
        fromCategoryId: product.category_id,
        fromSubcategoryId: product.subcategory_id,
      });
    }

    const existing = [...(variantsByProduct.get(product.id) ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label),
    );
    const desiredByLabel = new Map(row.variants.map((v) => [v.label, v]));
    const usedExisting = new Set<string>();

    for (const desired of row.variants) {
      const found = existing.find((v) => !usedExisting.has(v.id) && variantLabelKey(v.label) === desired.label);
      if (!found) {
        variantInserts.push({
          productId: product.id,
          productSlug: product.slug,
          name: product.source_name || product.name,
          variant: desired,
        });
        continue;
      }
      usedExisting.add(found.id);
      const priceDiffers = found.price_paise !== desired.pricePaise;
      const reenable = !found.available;
      if (priceDiffers || reenable) {
        priceUpdates.push({
          productId: product.id,
          variantId: found.id,
          name: product.source_name || product.name,
          label: found.label,
          fromPaise: found.price_paise,
          toPaise: desired.pricePaise,
          reenable,
        });
      }
    }

    for (const variant of existing) {
      if (usedExisting.has(variant.id)) continue;
      if (!variant.available) continue;
      const label = variantLabelKey(variant.label);
      if (desiredByLabel.has(label)) continue;
      variantDisables.push({
        productId: product.id,
        variantId: variant.id,
        name: product.source_name || product.name,
        label: variant.label,
        pricePaise: variant.price_paise,
      });
    }
  }

  const productUnpublishes: ProductUnpublish[] = [];
  for (const product of db.products) {
    if (!product.published) continue;
    if (matchedProductIds.has(product.id)) continue;
    const category = product.category_id ? categoryById.get(product.category_id) : undefined;
    if (!category || !UNPUBLISH_PRODUCT_CATEGORIES.has(category.slug)) continue;
    productUnpublishes.push({
      productId: product.id,
      name: product.source_name || product.name,
      categorySlug: category.slug,
    });
  }

  const sweets = db.categories.find((c) => c.slug === "sweets");
  const existingGajakSub = sweets
    ? db.subcategories.find((s) => s.category_id === sweets.id && s.slug === "gajak")
    : undefined;
  const gajakSubcategory: Plan["gajakSubcategory"] = !existingGajakSub
    ? { action: "create", title: "Gajak & Seasonal" }
    : existingGajakSub.title === "Gajak & Seasonal"
      ? { action: "reuse", title: existingGajakSub.title }
      : { action: "retitle", title: existingGajakSub.title };

  const categoryUnpublishes: Plan["categoryUnpublishes"] = [];
  const alreadyUnpublishedCategories: string[] = [];
  for (const slug of ["gajak", ...LEGACY_CATEGORY_SLUGS]) {
    const category = db.categories.find((c) => c.slug === slug);
    if (!category) {
      warnings.push(`Category not found, skip unpublish: ${slug}`);
      continue;
    }
    if (!category.published) {
      alreadyUnpublishedCategories.push(slug);
      continue;
    }
    categoryUnpublishes.push({ id: category.id, slug: category.slug, title: category.title });
  }

  const sweetsId = sweets?.id;
  const gajakSubId = existingGajakSub?.id;
  const movesNeeded = gajakMoves.filter((move) => {
    if (!sweetsId) return true;
    if (move.fromCategoryId !== sweetsId) return true;
    if (!gajakSubId || move.fromSubcategoryId !== gajakSubId) return true;
    return false;
  });

  return {
    warnings,
    parsedCounts,
    priceUpdates,
    variantInserts,
    variantDisables,
    productUnpublishes,
    gajakMoves: movesNeeded,
    categoryUnpublishes,
    missingInDb,
    alreadyUnpublishedCategories,
    gajakSubcategory,
  };
}

function printPlan(plan: Plan) {
  console.log("\n=== Parsed counts ===");
  for (const [slug, count] of Object.entries(plan.parsedCounts).sort()) {
    console.log(`  ${slug}: ${count}`);
  }

  console.log(`\n=== Price updates (${plan.priceUpdates.length}) ===`);
  for (const row of plan.priceUpdates) {
    const enable = row.reenable ? " + re-enable" : "";
    console.log(
      `  ${row.name} | ${row.label} | ₹${rupees(row.fromPaise)} -> ₹${rupees(row.toPaise)}${enable}`,
    );
  }

  console.log(`\n=== Variant inserts (${plan.variantInserts.length}) ===`);
  for (const row of plan.variantInserts) {
    console.log(`  ${row.name} | ${row.variant.label} | ₹${rupees(row.variant.pricePaise)}`);
  }

  console.log(`\n=== Variant disables (${plan.variantDisables.length}) ===`);
  for (const row of plan.variantDisables) {
    console.log(`  ${row.name} | ${row.label} | ₹${rupees(row.pricePaise)} -> available=false`);
  }

  console.log(`\n=== Unpublish products (${plan.productUnpublishes.length}) ===`);
  for (const row of plan.productUnpublishes) {
    console.log(`  [${row.categorySlug}] ${row.name}`);
  }

  console.log(`\n=== Gajak subcategory: ${plan.gajakSubcategory.action} (${plan.gajakSubcategory.title}) ===`);
  console.log(`\n=== Gajak moves to sweets/gajak (${plan.gajakMoves.length}) ===`);
  for (const row of plan.gajakMoves) {
    console.log(`  ${row.name}`);
  }

  console.log(`\n=== Unpublish categories (${plan.categoryUnpublishes.length}) ===`);
  for (const row of plan.categoryUnpublishes) {
    console.log(`  ${row.slug} (${row.title})`);
  }
  if (plan.alreadyUnpublishedCategories.length) {
    console.log(`  already unpublished: ${plan.alreadyUnpublishedCategories.join(", ")}`);
  }

  console.log(`\n=== JSON products missing in DB (${plan.missingInDb.length}) ===`);
  for (const row of plan.missingInDb) {
    console.log(`  [${row.categorySlug}] ${row.sourceName}`);
  }

  if (plan.warnings.length) {
    console.log(`\n=== Warnings (${plan.warnings.length}) ===`);
    for (const warning of plan.warnings) console.log(`  ${warning}`);
  }

  console.log("\n=== Counts ===");
  console.log(
    JSON.stringify(
      {
        priceUpdates: plan.priceUpdates.length,
        variantInserts: plan.variantInserts.length,
        variantDisables: plan.variantDisables.length,
        productUnpublishes: plan.productUnpublishes.length,
        gajakMoves: plan.gajakMoves.length,
        categoryUnpublishes: plan.categoryUnpublishes.length,
        missingInDb: plan.missingInDb.length,
      },
      null,
      2,
    ),
  );
}

function printCacheNote() {
  console.log("\n=== Catalog cache ===");
  console.log(
    "Catalogue queries in src/lib/catalog/queries.ts read Supabase on each request. They are not wrapped in unstable_cache, so the next request after deploy or dev picks up these DB changes.",
  );
  console.log(
    "Header search (src/lib/catalog/cached.ts getCachedProductSearchIndex) is the exception: unstable_cache tag \"products\", revalidate 60 seconds.",
  );
  console.log(
    "src/lib/catalog/tags.ts exports merchandising labels (Featured, Bestseller, New arrival, Seasonal), not Next.js cache tags. A tsx script cannot call revalidateTag. The search index refreshes within 60s, or sooner when an admin action calls revalidateTag(\"products\").",
  );
}

async function ensureGajakSubcategory(db: Awaited<ReturnType<typeof loadDb>>): Promise<string> {
  const sweets = db.categories.find((c) => c.slug === "sweets");
  if (!sweets) throw new Error("sweets category is missing");

  const existing = db.subcategories.find((s) => s.category_id === sweets.id && s.slug === "gajak");
  if (existing) {
    if (existing.title !== "Gajak & Seasonal") {
      const { error } = await supabase
        .from("subcategories")
        .update({ title: "Gajak & Seasonal", published: true })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    }
    return existing.id;
  }

  const sortOrder =
    db.subcategories
      .filter((s) => s.category_id === sweets.id)
      .reduce((max, s) => Math.max(max, s.sort_order), 0) + 1;

  const { data, error } = await supabase
    .from("subcategories")
    .insert({
      category_id: sweets.id,
      slug: "gajak",
      title: "Gajak & Seasonal",
      published: true,
      sort_order: sortOrder,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create gajak subcategory");
  return data.id;
}

async function applyPlan(plan: Plan, db: Awaited<ReturnType<typeof loadDb>>) {
  const sweets = db.categories.find((c) => c.slug === "sweets");
  if (!sweets) throw new Error("sweets category is missing");
  const gajakSubcategoryId = await ensureGajakSubcategory(db);

  for (const row of plan.priceUpdates) {
    const { error } = await supabase
      .from("product_variants")
      .update({ price_paise: row.toPaise, available: true })
      .eq("id", row.variantId);
    if (error) throw new Error(`Price update ${row.name} ${row.label}: ${error.message}`);
  }

  for (const row of plan.variantInserts) {
    const unitKey = row.variant.quantityValue
      ? `${row.variant.quantityValue}${row.variant.sellingUnit}`
      : row.variant.sellingUnit;
    const sku = await uniqueSku(row.productSlug, unitKey);
    const { error } = await supabase.from("product_variants").insert({
      product_id: row.productId,
      label: row.variant.label,
      sku,
      price_paise: row.variant.pricePaise,
      selling_unit: row.variant.sellingUnit,
      quantity_value: row.variant.quantityValue,
      weight_g: weightG(row.variant),
      stock_qty: 0,
      available: true,
      sort_order: row.variant.sortOrder,
    });
    if (error) throw new Error(`Insert variant ${row.name} ${row.variant.label}: ${error.message}`);
  }

  for (const row of plan.variantDisables) {
    const { error } = await supabase
      .from("product_variants")
      .update({ available: false })
      .eq("id", row.variantId);
    if (error) throw new Error(`Disable variant ${row.name} ${row.label}: ${error.message}`);
  }

  for (const row of plan.productUnpublishes) {
    const { error } = await supabase.from("products").update({ published: false }).eq("id", row.productId);
    if (error) throw new Error(`Unpublish ${row.name}: ${error.message}`);
  }

  for (const row of plan.gajakMoves) {
    const { error } = await supabase
      .from("products")
      .update({ category_id: sweets.id, subcategory_id: gajakSubcategoryId })
      .eq("id", row.productId);
    if (error) throw new Error(`Move gajak ${row.name}: ${error.message}`);
  }

  for (const row of plan.categoryUnpublishes) {
    const { error } = await supabase.from("categories").update({ published: false }).eq("id", row.id);
    if (error) throw new Error(`Unpublish category ${row.slug}: ${error.message}`);
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const file = resolve(process.cwd(), "jaijinendra_products.json");
  const raw = JSON.parse(readFileSync(file, "utf8")) as CatalogFile;
  const { products, warnings } = parseCatalog(raw);
  console.log(`Parsed ${products.length} products from ${file}`);

  const db = await loadDb();
  const plan = buildPlan(products, warnings, db);
  printPlan(plan);

  if (dryRun) {
    console.log("\nDRY RUN — no writes");
    printCacheNote();
    return;
  }

  console.log("\nApplying…");
  await applyPlan(plan, db);
  console.log("Applied.");
  printCacheNote();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
