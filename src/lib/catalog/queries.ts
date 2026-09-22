import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import {
  categoryQuerySlugs,
  dbSlugToCategoryId,
  normalizeCategoryRef,
  resolveCategorySlug,
} from "@/lib/catalog/aliases";
import {
  catalogueProducts,
  getProductBySlug as mockGetBySlug,
  getProductsByCategory as mockGetByCategory,
} from "@/data/catalogue";
import type {
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
  categories: { slug: string; title: string } | null;
  subcategories: { slug: string; title: string } | null;
  product_variants: DbVariantRow[];
  product_images: { storage_path: string; alt: string | null; sort_order: number }[];
  product_attribute_values?: {
    value_text: string | null;
    value_number: number | null;
    value_boolean: boolean | null;
    value_json: unknown;
    attribute_definitions: { key: string; label: string; data_type: string } | null;
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
      return { key: def.key, label: def.label, value };
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

  const minVariant = variants[0];
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

const productSelect = `
  id, slug, name, description, long_description, spice_note, dietary,
  badge, tagline, rating, review_count, seo_title, seo_description,
  featured, seasonal, origin, shelf_life, ingredients,
  categories ( slug, title ),
  subcategories ( slug, title ),
  product_variants (
    id, label, sku, price_paise, mrp_paise, stock_qty, sort_order,
    available, selling_unit, quantity_value
  ),
  product_images ( storage_path, alt, sort_order ),
  product_attribute_values (
    value_text, value_number, value_boolean, value_json,
    attribute_definitions ( key, label, data_type )
  )
`;

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
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
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
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return undefined;
  return mapDbProduct(data as unknown as DbProductRow);
}

export async function getProductsByCategory(
  category: string,
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return mockGetByCategory(category).map((p) =>
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

  const resolved = resolveCategorySlug(category) ?? category;
  const categorySlugs = categoryQuerySlugs(resolved);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("published", true)
    .in("categories.slug", categorySlugs)
    .order("name");

  if (error || !data?.length) return [];
  return (data as unknown as DbProductRow[]).map(mapDbProduct);
}

export async function getProductsBySubcategory(
  categorySlug: string,
  subcategorySlug: string,
): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];

  const resolved = resolveCategorySlug(categorySlug) ?? categorySlug;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("published", true)
    .eq("categories.slug", resolved)
    .eq("subcategories.slug", subcategorySlug)
    .order("name");

  if (error || !data?.length) return [];
  return (data as unknown as DbProductRow[]).map(mapDbProduct);
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
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
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

  const supabase = await createClient();
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
