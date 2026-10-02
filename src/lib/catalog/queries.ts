import { productDetailSchemaReady } from "@/lib/db/product-detail-schema";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import {
  BAKERY_MEMBER_SLUGS,
  categoryHref,
  categoryQuerySlugs,
  dbSlugToCategoryId,
  GAJAK_LISTING_SLUG,
  GAJAK_PARENT_SLUG,
  isBakeryMemberSlug,
  normalizeCategoryRef,
  productCategorySlug,
  resolveCategorySlug,
  STOREFRONT_CATALOGUE_SECTIONS,
} from "@/lib/catalog/aliases";
import {
  catalogueProducts,
  getProductBySlug as mockGetBySlug,
} from "@/data/catalogue";
import type {
  CatalogueFilterOption,
  Product,
  ProductAttribute,
  ProductVariant,
  SellingUnit,
} from "@/types/catalog";

type DbVariantRow = {
  id: string;
  label: string;
  sku: string;
  price_paise: number;
  mrp_paise: number | null;
  stock_qty: number;
  sort_order: number;
  available: boolean;
  selling_unit: string;
  quantity_value: number | null;
};

type DbProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  long_description: string | null;
  spice_note: string | null;
  dietary: string[] | null;
  badge: string | null;
  tagline: string | null;
  rating: number | null;
  review_count: number | null;
  seo_title: string | null;
  seo_description: string | null;
  featured: boolean | null;
  seasonal: boolean | null;
  origin: string | null;
  shelf_life: string | null;
  ingredients: string[] | null;
  shipping_title?: string | null;
  shipping_note: string | null;
  highlights: string[] | null;
  tags: string[] | null;
  categories: { slug: string; title: string } | null;
  subcategories: { slug: string; title: string } | null;
  product_variants: DbVariantRow[];
  product_images: { storage_path: string; alt: string | null; sort_order: number }[];
  product_attribute_values?: {
    value_text: string | null;
    value_number: number | null;
    value_boolean: boolean | null;
    value_json: unknown;
    attribute_definitions: {
      key: string;
      label: string;
      data_type: string;
      filterable?: boolean | null;
      filter_group?: string | null;
    } | null;
  }[];
};

function mapVariant(v: DbVariantRow): ProductVariant {
  return {
    id: v.id,
    label: v.label,
    sellingUnit: (v.selling_unit ?? "other") as SellingUnit,
    quantityValue: v.quantity_value != null ? Number(v.quantity_value) : null,
    price: v.price_paise / 100,
    originalPrice:
      v.mrp_paise != null && v.mrp_paise > v.price_paise
        ? v.mrp_paise / 100
        : undefined,
    sku: v.sku,
    stockQty: v.stock_qty,
    available: v.available,
    variantId: v.id,
  };
}

function mapAttributes(
  rows: DbProductRow["product_attribute_values"],
): ProductAttribute[] {
  if (!rows?.length) return [];
  return rows
    .filter((r) => r.attribute_definitions)
    .map((r) => {
      const def = r.attribute_definitions!;
      let value: unknown = r.value_text;
      if (def.data_type === "number" || def.data_type === "number_unit") {
        value = r.value_number;
      } else if (def.data_type === "boolean") {
        value = r.value_boolean;
      } else if (def.data_type === "multi_select") {
        value = r.value_json;
      }
      return {
        key: def.key,
        label: def.label,
        value,
        dataType: def.data_type,
        filterable: Boolean(def.filterable),
        filterGroup: def.filter_group,
      };
    });
}

function mapDbProduct(row: DbProductRow): Product {
  const images = [...(row.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const image = images[0];
  const categorySlug = row.categories?.slug ?? "namkeen";

  const variants: ProductVariant[] = (row.product_variants ?? [])
    .filter((v) => v.available && v.price_paise > 0)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapVariant);

  const minPrice =
    variants.length > 0
      ? Math.min(...variants.map((v) => v.price ?? 0))
      : 0;

  const minMrp = variants
    .map((v) => v.originalPrice)
    .filter((p): p is number => p != null && p > minPrice);
  const originalPrice =
    minMrp.length > 0 ? Math.min(...minMrp) : undefined;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    longDescription: row.long_description ?? undefined,
    category: {
      slug: categorySlug,
      title: row.categories?.title ?? categorySlug,
    },
    subcategory: row.subcategories
      ? { slug: row.subcategories.slug, title: row.subcategories.title }
      : null,
    image: image?.storage_path ?? "/images/prod0.jpg",
    imageAlt: image?.alt ?? row.name,
    images: images.map((img) => ({
      src: img.storage_path,
      alt: img.alt ?? undefined,
    })),
    badge: row.badge ?? undefined,
    tags: row.tags?.filter(Boolean) ?? undefined,
    highlights: row.highlights?.filter(Boolean) ?? undefined,
    shippingTitle: row.shipping_title ?? undefined,
    shippingNote: row.shipping_note ?? undefined,
    tagline: row.tagline ?? undefined,
    featured: row.featured ?? undefined,
    seasonal: row.seasonal ?? undefined,
    attributes: mapAttributes(row.product_attribute_values),
    variants,
    price: minPrice,
    originalPrice,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    spiceNote: (row.spice_note as Product["spiceNote"]) ?? undefined,
    dietary: row.dietary ?? undefined,
    ingredients: row.ingredients ?? undefined,
    shelfLife: row.shelf_life ?? undefined,
    origin: row.origin ?? undefined,
  };
}

/** Legacy mock mapper for static catalogue data. */
function mapMockProduct(p: Product): Product {
  const categorySlug =
    typeof p.category === "object" && p.category
      ? p.category.slug
      : String(p.category);
  return {
    ...p,
    id: p.id,
    category: {
      slug: categorySlug,
      title: categorySlug,
    },
    subcategory: p.subcategory ?? null,
    attributes: p.attributes ?? [],
    variants: p.variants.map((v) => ({
      ...v,
      id: v.variantId ?? v.id,
      sellingUnit: v.sellingUnit ?? "other",
      quantityValue: v.quantityValue ?? null,
      available: v.available ?? true,
      stockQty: v.stockQty ?? 0,
      sku: v.sku ?? `${p.slug}-${v.id}`,
    })),
  };
}

function productSelect(detailSchema: boolean) {
  const detailColumns = detailSchema
    ? "shipping_title, shipping_note, highlights, tags,"
    : "";
  const definitionColumns = detailSchema
    ? "key, label, data_type, filterable, filter_group"
    : "key, label, data_type";
  return `
  id, slug, name, description, long_description, spice_note, dietary,
  badge, tagline, rating, review_count, seo_title, seo_description,
  featured, seasonal, origin, shelf_life, ingredients,
  ${detailColumns}
  categories ( slug, title ),
  subcategories ( slug, title ),
  product_variants (
    id, label, sku, price_paise, mrp_paise, stock_qty, sort_order,
    available, selling_unit, quantity_value
  ),
  product_images ( storage_path, alt, sort_order ),
  product_attribute_values (
    value_text, value_number, value_boolean, value_json,
    attribute_definitions ( ${definitionColumns} )
  )
`;
}

/**
 * Embed filters only apply to parent rows when the relationship is inner.
 * A plain `categories.slug` filter empties the embed, so every product falls
 * through as namkeen and category pages 404.
 */
function productSelectFiltered(options: {
  category?: boolean;
  subcategory?: boolean;
  detailSchema?: boolean;
}): string {
  let select = productSelect(Boolean(options.detailSchema));
  if (options.category) {
    select = select.replace(
      "categories ( slug, title )",
      "categories!inner ( slug, title )",
    );
  }
  if (options.subcategory) {
    select = select.replace(
      "subcategories ( slug, title )",
      "subcategories!inner ( slug, title )",
    );
  }
  return select;
}

/**
 * When Supabase is configured: DB only (empty on error — never mock).
 * When offline: static catalogue for local demos.
 */
export async function getPublishedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return catalogueProducts.map((p) =>
      mapMockProduct({
        ...p,
        category: {
          slug: String(p.category),
          title: String(p.category),
        },
        attributes: [],
        variants: p.variants.map((v) => ({
          id: v.variantId ?? v.id,
          label: v.label,
          sellingUnit: "other",
          quantityValue: null,
          price: v.price ?? p.price,
          sku: v.sku ?? `${p.slug}-${v.id}`,
          stockQty: v.stockQty ?? 0,
          available: true,
          variantId: v.variantId ?? v.id,
        })),
      } as Product),
    );
  }

  const supabase = await createClient();
  const detailSchema = await productDetailSchemaReady(supabase);
  const { data, error } = await supabase
    .from("products")
    .select(productSelect(detailSchema))
    .eq("published", true)
    .order("name");

  if (error || !data?.length) return [];
  return (data as unknown as DbProductRow[]).map(mapDbProduct);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  if (!isSupabaseConfigured()) {
    const p = mockGetBySlug(slug);
    if (!p) return undefined;
    return mapMockProduct({
      ...p,
      category: { slug: String(p.category), title: String(p.category) },
      attributes: [],
      variants: p.variants.map((v) => ({
        id: v.variantId ?? v.id,
        label: v.label,
        sellingUnit: "other" as const,
        quantityValue: null,
        price: v.price ?? p.price,
        sku: v.sku ?? `${p.slug}-${v.id}`,
        stockQty: v.stockQty ?? 0,
        available: true,
        variantId: v.variantId ?? v.id,
      })),
    } as Product);
  }

  const supabase = await createClient();
  const detailSchema = await productDetailSchemaReady(supabase);
  const { data, error } = await supabase
    .from("products")
    .select(productSelect(detailSchema))
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return undefined;
  return mapDbProduct(data as unknown as DbProductRow);
}

export async function getProductsByCategory(
  category: string,
): Promise<Product[]> {
  const resolved = resolveCategorySlug(category) ?? category;
  const categorySlugs = categoryQuerySlugs(resolved);

  if (!isSupabaseConfigured()) {
    const allowed = new Set(categorySlugs);
    return catalogueProducts
      .filter((p) => allowed.has(String(p.category)))
      .map((p) =>
        mapMockProduct({
          ...p,
          category: { slug: String(p.category), title: String(p.category) },
          variants: p.variants.map((v) => ({
            id: v.variantId ?? v.id,
            label: v.label,
            sellingUnit: "other" as const,
            quantityValue: null,
            price: v.price ?? p.price,
            sku: v.sku ?? `${p.slug}-${v.id}`,
            stockQty: v.stockQty ?? 0,
            available: true,
            variantId: v.variantId ?? v.id,
          })),
        } as Product),
      );
  }

  const supabase = await createClient();
  const detailSchema = await productDetailSchemaReady(supabase);
  const { data, error } = await supabase
    .from("products")
    .select(productSelectFiltered({ category: true, detailSchema }))
    .eq("published", true)
    .in("categories.slug", categorySlugs)
    .order("name");

  if (error || !data?.length) return [];
  const allowed = new Set(categorySlugs);
  return (data as unknown as DbProductRow[])
    .map(mapDbProduct)
    .filter((product) => allowed.has(productCategorySlug(product)));
}

export type StorefrontChild = {
  slug: string;
  title: string;
};

export type CatalogueSection = {
  slug: string;
  title: string;
  showBakeryMarks: boolean;
  children: StorefrontChild[];
  products: Product[];
};

type PublishedTaxonomy = {
  titles: Map<string, string>;
  childrenByCategorySlug: Map<string, StorefrontChild[]>;
};

/**
 * Published category and subcategory titles.
 * Empty when Supabase is unavailable — callers must not fall back to mock catalog data.
 */
async function loadPublishedTaxonomy(): Promise<PublishedTaxonomy | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const [categoriesResult, subcategoriesResult] = await Promise.all([
    supabase.from("categories").select("id, slug, title").eq("published", true),
    supabase
      .from("subcategories")
      .select("category_id, slug, title, sort_order")
      .eq("published", true)
      .order("sort_order"),
  ]);

  if (
    categoriesResult.error ||
    !categoriesResult.data ||
    subcategoriesResult.error ||
    !subcategoriesResult.data
  ) {
    return null;
  }

  const idToSlug = new Map(
    categoriesResult.data.map((category) => [category.id, category.slug]),
  );
  const titles = new Map(
    categoriesResult.data.map((category) => [category.slug, category.title]),
  );
  const childrenByCategorySlug = new Map<string, StorefrontChild[]>();

  for (const row of subcategoriesResult.data) {
    const parentSlug = idToSlug.get(row.category_id);
    if (!parentSlug) continue;
    const list = childrenByCategorySlug.get(parentSlug) ?? [];
    list.push({ slug: row.slug, title: row.title });
    childrenByCategorySlug.set(parentSlug, list);
  }

  return { titles, childrenByCategorySlug };
}

function childrenForResolvedSlug(
  resolvedSlug: string,
  taxonomy: PublishedTaxonomy,
): StorefrontChild[] {
  if (resolvedSlug === "bakery") {
    return BAKERY_MEMBER_SLUGS.flatMap((slug) => {
      const title = taxonomy.titles.get(slug);
      return title ? [{ slug, title }] : [];
    });
  }
  return taxonomy.childrenByCategorySlug.get(resolvedSlug) ?? [];
}

/** Subcategory pills for a storefront category. Bakery children are sibling categories. */
export async function getStorefrontCategoryChildren(
  categorySlug: string,
): Promise<StorefrontChild[]> {
  const resolved = resolveCategorySlug(categorySlug) ?? categorySlug;
  const taxonomy = await loadPublishedTaxonomy();
  if (!taxonomy) return [];
  return childrenForResolvedSlug(resolved, taxonomy);
}

/**
 * `/catalogue/gajak` is not a storefront section. Products live under sweets
 * with subcategory slug `gajak`. Also include anything still on the legacy
 * gajak category until that category is unpublished.
 */
async function getGajakListingProducts(): Promise<Product[]> {
  const [moved, legacy] = await Promise.all([
    getProductsBySubcategory(GAJAK_PARENT_SLUG, GAJAK_LISTING_SLUG),
    getProductsByCategory(GAJAK_LISTING_SLUG),
  ]);
  const seen = new Set<string>();
  const products: Product[] = [];
  for (const product of [...moved, ...legacy]) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    products.push(product);
  }
  products.sort((a, b) => a.name.localeCompare(b.name));
  return products;
}

/**
 * Products for a category page, honoring `?sub=`.
 * Bakery filters by member category slug; other categories use the subcategory relation.
 * The gajak route lists the gajak subcategory of sweets when no `?sub=` is set.
 */
export async function getCategoryListingProducts(
  categorySlug: string,
  subcategorySlug: string | null,
): Promise<Product[]> {
  const resolved = resolveCategorySlug(categorySlug) ?? categorySlug;
  if (
    subcategorySlug &&
    resolved === "bakery" &&
    isBakeryMemberSlug(subcategorySlug)
  ) {
    return getProductsByCategory(subcategorySlug);
  }
  if (subcategorySlug && resolved !== "bakery") {
    return getProductsBySubcategory(resolved, subcategorySlug);
  }
  if (resolved === GAJAK_LISTING_SLUG) return getGajakListingProducts();
  return getProductsByCategory(resolved);
}

/** One block per parent category for /catalogue. Empty groups when Supabase is off. */
export async function getCatalogueOverview(): Promise<CatalogueSection[]> {
  if (!isSupabaseConfigured()) {
    return STOREFRONT_CATALOGUE_SECTIONS.map((section) => ({
      slug: section.slug,
      title: section.title,
      showBakeryMarks: section.slug === "bakery",
      children: [],
      products: [],
    }));
  }

  const [taxonomy, products, tiles] = await Promise.all([
    loadPublishedTaxonomy(),
    getPublishedProducts(),
    getHomeCategoryTiles(),
  ]);

  return tiles.map((tile) => ({
    slug: tile.slug,
    title: tile.title,
    showBakeryMarks: false,
    children: taxonomy ? childrenForResolvedSlug(tile.slug, taxonomy) : [],
    products: products
      .filter((product) => productCategorySlug(product) === tile.slug)
      .slice(0, 3),
  }));
}

export async function getProductsBySubcategory(
  categorySlug: string,
  subcategorySlug: string,
): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];

  const resolved = resolveCategorySlug(categorySlug) ?? categorySlug;
  const supabase = await createClient();
  const detailSchema = await productDetailSchemaReady(supabase);
  const categorySlugs = categoryQuerySlugs(resolved);
  const { data, error } = await supabase
    .from("products")
    .select(
      productSelectFiltered({ category: true, subcategory: true, detailSchema }),
    )
    .eq("published", true)
    .in("categories.slug", categorySlugs)
    .eq("subcategories.slug", subcategorySlug)
    .order("name");

  if (error || !data?.length) return [];
  const allowedCategories = new Set(categoryQuerySlugs(resolved));
  return (data as unknown as DbProductRow[])
    .map(mapDbProduct)
    .filter((product) => {
      const subSlug =
        product.subcategory && typeof product.subcategory === "object"
          ? product.subcategory.slug
          : null;
      return (
        allowedCategories.has(productCategorySlug(product)) &&
        subSlug === subcategorySlug
      );
    });
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    const products = catalogueProducts;
    const q = query.trim().toLowerCase();
    if (!q) return products as unknown as Product[];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    ) as unknown as Product[];
  }

  const q = query.trim();
  if (!q) return getPublishedProducts();

  const supabase = await createClient();
  const detailSchema = await productDetailSchemaReady(supabase);
  const { data, error } = await supabase
    .from("products")
    .select(productSelect(detailSchema))
    .eq("published", true)
    .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    .order("name")
    .limit(50);

  if (error || !data?.length) return [];
  return (data as unknown as DbProductRow[]).map(mapDbProduct);
}

export async function getVariantSku(productSlug: string, variantId: string) {
  return `${productSlug}-${variantId}`;
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const categoryId = dbSlugToCategoryId(normalizeCategoryRef(product.category).slug);
  const products = await getProductsByCategory(categoryId);
  return products
    .filter((item) => item.id !== product.id)
    .slice(0, limit);
}

export async function getAllVariantSkus(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!isSupabaseConfigured()) {
    for (const p of catalogueProducts) {
      for (const v of p.variants) {
        map.set(`${p.slug}:${v.id}`, `${p.slug}-${v.id}`);
      }
    }
    return map;
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("product_variants")
    .select("id, sku, products(slug)")
    .returns<{ id: string; sku: string; products: { slug: string } }[]>();

  for (const row of data ?? []) {
    map.set(`${row.products.slug}:${row.id}`, row.sku);
  }
  return map;
}

/** Lightweight index for search UI (id/name/slug + price). */
export async function getProductSearchIndex(): Promise<
  { id: string; name: string; slug: string; price: number; description: string }[]
> {
  if (!isSupabaseConfigured()) {
    return catalogueProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      description: p.description,
    }));
  }

  // Use service-role client — this runs inside unstable_cache (no request cookies).
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, product_variants ( price_paise, available )",
    )
    .eq("published", true)
    .order("name");

  if (error || !data) return [];

  return data.map((row) => {
    const variants = ((row.product_variants ?? []) as unknown as {
      price_paise: number;
      available: boolean;
    }[]).filter((v) => v.available);
    const minPaise =
      variants.length > 0
        ? Math.min(...variants.map((v) => v.price_paise))
        : 0;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description ?? "",
      price: minPaise / 100,
    };
  });
}

export type SpecialAttentionCategory = {
  id: string;
  title: string;
  slug: string;
  href: string;
};

export type CatalogueSpecialtyFilter = CatalogueFilterOption & { href: string };

/** Published categories with live product counts for the catalogue sidebar. */
export async function getCatalogueSpecialtyFilters(): Promise<
  CatalogueSpecialtyFilter[]
> {
  if (!isSupabaseConfigured()) {
    const counts = new Map<string, { label: string; count: number }>();
    for (const product of catalogueProducts) {
      const slug = String(product.category);
      const current = counts.get(slug);
      counts.set(slug, {
        label: current?.label ?? slug,
        count: (current?.count ?? 0) + 1,
      });
    }
    return [...counts.entries()].map(([slug, item]) => ({
      id: slug,
      label: item.label,
      count: item.count,
      href: categoryHref(slug),
    }));
  }

  const supabase = await createClient();
  const [categoriesResult, productsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, title")
      .eq("published", true)
      .order("sort_order"),
    supabase.from("products").select("category_id").eq("published", true),
  ]);

  const counts = new Map<string, number>();
  for (const row of productsResult.data ?? []) {
    if (!row.category_id) continue;
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }

  return (categoriesResult.data ?? []).map((category) => ({
    id: category.slug,
    label: category.title,
    count: counts.get(category.id) ?? 0,
    href: categoryHref(category.slug),
  }));
}

export type HomeCategoryTile = {
  id: string;
  slug: string;
  title: string;
  href: string;
  image: string | null;
  featured: boolean;
};

/** Published categories for the homepage favourites row. */
export async function getHomeCategoryTiles(): Promise<HomeCategoryTile[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, title, image_url, featured")
    .eq("published", true)
    .order("sort_order");

  if (error || !data) return [];

  return data.map((category) => ({
    id: category.id,
    slug: category.slug,
    title: category.title,
    href: categoryHref(category.slug),
    image: category.image_url,
    featured: category.featured,
  }));
}

/** Featured categories for storefront navbar + CTA (no cookies — safe in layout). */
export async function getSpecialAttentionCategories(): Promise<
  SpecialAttentionCategory[]
> {
  if (!isSupabaseConfigured()) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("categories")
    .select("id, title, slug")
    .eq("published", true)
    .eq("featured", true)
    .order("sort_order");

  if (error || !data) return [];

  return data.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    href: categoryHref(c.slug),
  }));
}
