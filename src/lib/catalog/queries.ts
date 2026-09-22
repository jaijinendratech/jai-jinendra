import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import {
  catalogueProducts,
  getProductBySlug as mockGetBySlug,
  getProductsByCategory as mockGetByCategory,
} from "@/data/catalogue";
import type { Product, ProductVariant } from "@/types/catalog";

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
  categories: { slug: string } | null;
  product_variants: {
    id: string;
    label: string;
    sku: string;
    price_paise: number;
    stock_qty: number;
  }[];
  product_images: { storage_path: string; alt: string | null; sort_order: number }[];
};

function mapDbProduct(row: DbProductRow): Product {
  const images = [...(row.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const image = images[0];

  const variants: ProductVariant[] = (row.product_variants ?? [])
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((v) => ({
      id: v.sku.split("-").pop() ?? v.id,
      label: v.label,
      price: v.price_paise / 100,
      sku: v.sku,
      variantId: v.id,
      stockQty: v.stock_qty,
    }));

  const minPrice =
    variants.length > 0
      ? Math.min(...variants.map((v) => v.price ?? 0))
      : 0;

  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    description: row.description,
    longDescription: row.long_description ?? undefined,
    image: image?.storage_path ?? "/images/prod0.jpg",
    imageAlt: image?.alt ?? row.name,
    price: minPrice,
    badge: row.badge ?? undefined,
    tagline: row.tagline ?? undefined,
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    category: (row.categories?.slug ?? "namkeens") as Product["category"],
    variants,
    spiceNote: (row.spice_note as Product["spiceNote"]) ?? undefined,
    dietary: row.dietary ?? undefined,
  };
}

const productSelect = `
  id, slug, name, description, long_description, spice_note, dietary,
  badge, tagline, rating, review_count,
  categories ( slug ),
  product_variants ( id, label, sku, price_paise, stock_qty ),
  product_images ( storage_path, alt, sort_order )
`;

/**
 * When Supabase is configured: DB only (empty on error — never mock).
 * When offline: static catalogue for local demos.
 */
export async function getPublishedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return catalogueProducts;

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
  if (!isSupabaseConfigured()) return mockGetBySlug(slug);

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
  if (!isSupabaseConfigured()) return mockGetByCategory(category);

  const supabase = await createClient();

  if (category === "all") {
    return getPublishedProducts();
  }

  const categorySlugs =
    category === "combos" ? ["tea-time", "combos"] : [category];

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, slug, name, description, long_description, spice_note, dietary,
      badge, tagline, rating, review_count,
      categories!inner ( slug ),
      product_variants ( id, label, sku, price_paise, stock_qty ),
      product_images ( storage_path, alt, sort_order )
    `,
    )
    .eq("published", true)
    .in("categories.slug", categorySlugs)
    .order("name");

  if (error || !data?.length) return [];
  return (data as unknown as DbProductRow[]).map(mapDbProduct);
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    const products = catalogueProducts;
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
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
  const products = await getProductsByCategory(product.category);
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
    .select("sku, products(slug)")
    .returns<{ sku: string; products: { slug: string } }[]>();

  for (const row of data ?? []) {
    const slug = row.products.slug;
    const variantKey = row.sku.replace(`${slug}-`, "");
    map.set(`${slug}:${variantKey}`, row.sku);
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
      "id, name, slug, description, product_variants ( price_paise )",
    )
    .eq("published", true)
    .order("name");

  if (error || !data) return [];

  return data.map((row) => {
    const variants = ((row.product_variants ?? []) as unknown as {
      price_paise: number;
    }[]);
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
