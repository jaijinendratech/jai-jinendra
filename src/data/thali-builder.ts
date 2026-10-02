export const thaliBuilderMeta = {
  eyebrow: "✦ BUILD YOUR OWN ✦",
  mobileEyebrow: "Build Your Own",
  centerLabel: "Royal Feast",
  slotCount: 6,
  /** Used only until Admin → Content → Home saves a value. */
  defaultDiscountPercent: 10,
  /** Products pulled per category card when building the pool (page.tsx). */
  poolItemsPerGroup: 5,
  /** Item rows shown per card before "View More". */
  cardPreviewCount: 3,
} as const;

export type ThaliCategoryGroupId = "sweets" | "namkeens" | "bakery" | "gajak";

export type ThaliCategoryGroup = {
  id: ThaliCategoryGroupId;
  label: string;
  /**
   * A single slug resolvable by resolveCategorySlug/getProductsByCategory
   * (src/lib/catalog/aliases.ts, src/lib/catalog/queries.ts). "bakery" is
   * the virtual category already set up for the /catalogue/bakery nav page
   * (expands to cookies + dry-cakes server-side) — reused here as-is.
   */
  categorySlug: string;
  icon: "candy" | "flame" | "wheat" | "crown";
};

/**
 * Item-picker cards shown below the plate — one per category, matching the
 * site's own first four nav categories (Sweets, Namkeens, Bakery, Gajak).
 * Products are fetched per group with getProductsByCategory (see
 * src/app/page.tsx) rather than filtered out of the flat published-products
 * list, since that list's category field isn't reliably resolvable for
 * every category in this catalogue.
 */
export const thaliCategoryGroups: ThaliCategoryGroup[] = [
  { id: "sweets", label: "Sweets", categorySlug: "sweets", icon: "candy" },
  { id: "namkeens", label: "Namkeens", categorySlug: "namkeen", icon: "flame" },
  { id: "bakery", label: "Bakery", categorySlug: "bakery", icon: "wheat" },
  { id: "gajak", label: "Gajak", categorySlug: "gajak", icon: "crown" },
];
