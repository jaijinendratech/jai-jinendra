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

/**
 * Sibling categories grouped under the storefront Bakery page.
 * Bakery is not a database category.
 */
export const BAKERY_MEMBER_SLUGS = [
  "tea-time-bites",
  "dry-cakes",
  "cookies",
] as const;

/** All-page parent blocks, in storefront order. Gajak is a sweets subcategory, not a section. */
export const STOREFRONT_CATALOGUE_SECTIONS = [
  { slug: "namkeen", title: "Namkeen" },
  { slug: "sweets", title: "Sweets" },
  { slug: "gifting", title: "Gifting" },
  { slug: "bakery", title: "Bakery" },
] as const;

/**
 * Legacy `/catalogue/gajak` route.
 * Resolves as its own slug (not `sweets`). The category page applies `?sub=`
 * only, so aliasing gajak → sweets would list every sweet. The listing loads
 * sweets products whose subcategory slug is `gajak`.
 */
export const GAJAK_LISTING_SLUG = "gajak";
export const GAJAK_LISTING_TITLE = "Gajak";
export const GAJAK_PARENT_SLUG = "sweets";

export function isBakeryMemberSlug(slug: string): boolean {
  return (BAKERY_MEMBER_SLUGS as readonly string[]).includes(slug);
}

/** URL / nav alias → query key. `bakery` groups sibling categories; it is not a DB row. */
const ALIAS_TO_DB: Record<string, string> = {
  sweets: "sweets",
  mithai: "sweets",
  namkeen: "namkeen",
  namkeens: "namkeen",
  bakery: "bakery",
  "tea-time-bites": "tea-time-bites",
  snacks: "tea-time-bites",
  "tea-time": "tea-time-bites",
  "dry-cakes": "dry-cakes",
  cookies: "cookies",
  // Not "sweets": see GAJAK_LISTING_SLUG.
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
  bakery: "bakery",
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
    bakery: "bakery",
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
  if (resolvedDbSlug === "bakery") {
    return [
      ...new Set(BAKERY_MEMBER_SLUGS.flatMap((slug) => categoryQuerySlugs(slug))),
    ];
  }
  if (resolvedDbSlug === "combos") return ["tea-time-bites", "combos", "tea-time"];
  if (resolvedDbSlug === "sweets") return ["sweets", "mithai"];
  if (resolvedDbSlug === "namkeen") return ["namkeen", "namkeens"];
  if (resolvedDbSlug === "gifting") return ["gifting", "gifts"];
  if (resolvedDbSlug === "tea-time-bites")
    return ["tea-time-bites", "tea-time"];
  // Legacy gajak category only. Adding "sweets" here would make category-only
  // queries (overview, related products) return every sweet. The gajak URL
  // filters by subcategory in getCategoryListingProducts.
  if (resolvedDbSlug === GAJAK_LISTING_SLUG) return [GAJAK_LISTING_SLUG];
  return [resolvedDbSlug];
}
