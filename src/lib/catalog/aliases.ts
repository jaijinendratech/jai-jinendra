import type { CategoryId } from "@/types/catalog";

/** Canonical storefront category slugs (Excel-aligned). */
export const CANONICAL_CATEGORY_SLUGS = [
  "sweets",
  "namkeen",
  "tea-time-bites",
  "dry-cakes",
  "cookies",
  "gajak",
  "gifting",
  "kachoris",
  "combos",
  "gifts",
  "tea-time",
  "dry-fruits",
  "mithai",
  "namkeens",
] as const;

export type CanonicalCategorySlug = (typeof CANONICAL_CATEGORY_SLUGS)[number];

/** URL / nav alias → DB category slug used in queries. */
const ALIAS_TO_DB: Record<string, string> = {
  sweets: "sweets",
  mithai: "sweets",
  namkeen: "namkeen",
  namkeens: "namkeen",
  "tea-time-bites": "tea-time-bites",
  snacks: "tea-time-bites",
  "tea-time": "tea-time-bites",
  "dry-cakes": "dry-cakes",
  cookies: "cookies",
  gajak: "gajak",
  gifting: "gifting",
  gifts: "gifting",
  hampers: "gifting",
  kachoris: "kachoris",
  combos: "combos",
  "dry-fruits": "dry-fruits",
};

/** DB slug → preferred storefront URL segment (legacy routes still resolve). */
const DB_TO_PREFERRED_URL: Record<string, string> = {
  sweets: "sweets",
  namkeen: "namkeen",
  "tea-time-bites": "tea-time-bites",
  "dry-cakes": "dry-cakes",
  cookies: "cookies",
  gajak: "gajak",
  gifting: "gifting",
  kachoris: "kachoris",
  combos: "combos",
  "dry-fruits": "dry-fruits",
  mithai: "sweets",
  namkeens: "namkeen",
  gifts: "gifting",
  "tea-time": "tea-time-bites",
};

/** All URL segments that should resolve to a category listing. */
export const CATEGORY_ROUTE_ALIASES = [
  ...new Set([...Object.keys(ALIAS_TO_DB), ...Object.values(ALIAS_TO_DB)]),
];

export function resolveCategorySlug(raw: string): string | null {
  const key = raw.trim().toLowerCase();
  return ALIAS_TO_DB[key] ?? null;
}

/** Map DB category slug to CategoryId union (legacy ids preserved where needed). */
export function dbSlugToCategoryId(dbSlug: string): CategoryId {
  const map: Record<string, CategoryId> = {
    sweets: "sweets",
    mithai: "sweets",
    namkeen: "namkeen",
    namkeens: "namkeen",
    "tea-time-bites": "tea-time-bites",
    "tea-time": "tea-time-bites",
    snacks: "tea-time-bites",
    "dry-cakes": "dry-cakes",
    cookies: "cookies",
    gajak: "gajak",
    gifting: "gifting",
    gifts: "gifting",
    hampers: "gifting",
    kachoris: "kachoris",
    combos: "combos",
    "dry-fruits": "dry-fruits",
  };
  return map[dbSlug] ?? "namkeen";
}

export function categoryHref(dbSlug: string): string {
  const segment = DB_TO_PREFERRED_URL[dbSlug] ?? dbSlug;
  if (segment === "combos") return "/combos";
  return `/catalogue/${segment}`;
}

export function productCategorySlug(product: { category: { slug: string } | string }): string {
  return typeof product.category === "string"
    ? product.category
    : product.category.slug;
}

export function normalizeCategoryRef(
  category: import("@/types/catalog").CategoryRef | import("@/types/catalog").CategoryId | "all",
): import("@/types/catalog").CategoryRef {
  if (typeof category === "object" && category) return category;
  const slug = String(category);
  return { slug, title: slug };
}

/** Slugs to query when filtering products for a resolved category. */
export function categoryQuerySlugs(resolvedDbSlug: string): string[] {
  if (resolvedDbSlug === "combos") return ["tea-time-bites", "combos", "tea-time"];
  if (resolvedDbSlug === "sweets") return ["sweets", "mithai"];
  if (resolvedDbSlug === "namkeen") return ["namkeen", "namkeens"];
  if (resolvedDbSlug === "gifting") return ["gifting", "gifts"];
  if (resolvedDbSlug === "tea-time-bites")
    return ["tea-time-bites", "tea-time"];
  return [resolvedDbSlug];
}
