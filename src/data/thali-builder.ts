export const thaliBuilderMeta = {
  eyebrow: "✦ BUILD YOUR OWN ✦",
  mobileEyebrow: "Build Your Own",
  /** Must match thaliSlotPositions.length, the plate PNG has 4 bowls. */
  slotCount: 4,
  /** Used only until Admin → Content → Home saves a value. */
  defaultDiscountPercent: 10,
  /** Item rows shown per card before "View More". */
  cardPreviewCount: 3,
} as const;

/** public/images/thali-plate.png, real pixel size, for a true-ratio aspect box. */
export const thaliPlateImage = {
  src: "/images/thali-plate.webp",
  width: 546,
  height: 457,
} as const;

/**
 * Bowl center as % of thali-plate.png (546×457), measured from the asset's
 * white placeholder circles (scripts/measure-thali-bowls.mjs).
 */
export const thaliSlotPositions = [
  { x: 37.4, y: 30.9 },
  { x: 64.1, y: 30.9 },
  { x: 37.4, y: 62.8 },
  { x: 64.1, y: 62.8 },
] as const;

/** Circular clip diameter as % of plate width, sized to fill the brass bowl cavity. */
export const thaliSlotWidthPercent = 23;

/** Reference bowl asset (e.g. Aloo Sev PNG), keep admin copy aligned with this. */
export const thaliBowlImageReference = {
  widthPx: 1271,
  heightPx: 1238,
  aspectRatioLabel: "1:1 (square)",
  aspectRatioNote: "~1.03:1 (1271 × 1238 px reference)",
  format: "PNG (RGBA, transparent background)",
} as const;

export type AdminImageUploadGuide = {
  summary: string;
  specs: ReadonlyArray<{ label: string; value: string }>;
  footer?: string;
};

/** Admin copy, keep in sync with ThaliBuilder slot image rendering. */
export const thaliProductImageUploadGuide: AdminImageUploadGuide = {
  summary:
    "Shown only in the homepage “Build Your Thali” brass bowl. Not used on product cards or the shop.",
  specs: [
    {
      label: "Dimensions",
      value: `${thaliBowlImageReference.widthPx} × ${thaliBowlImageReference.heightPx} px (reference export size)`,
    },
    {
      label: "Aspect ratio",
      value: `${thaliBowlImageReference.aspectRatioLabel}, ${thaliBowlImageReference.aspectRatioNote}`,
    },
    { label: "Format", value: thaliBowlImageReference.format },
    {
      label: "Framing",
      value:
        "Top-down view. Center the dish and fill the square so the brass bowl looks full on the plate.",
    },
    {
      label: "Avoid",
      value:
        "Side angles, wide banners, or large empty margins. They make the bowl look half empty.",
    },
  ],
  footer:
    "Optional. If you remove this image, the regular product image is used in the thali instead.",
};

/** Admin copy for catalogue / PDP product gallery uploads. */
export const productImageUploadGuide: AdminImageUploadGuide = {
  summary:
    "Used on product pages and catalogue cards. Also used on the homepage thali when no dedicated thali image is set.",
  specs: [
    {
      label: "Dimensions",
      value: `${thaliBowlImageReference.widthPx} × ${thaliBowlImageReference.heightPx} px recommended (or larger square export)`,
    },
    {
      label: "Aspect ratio",
      value: `${thaliBowlImageReference.aspectRatioLabel}, ${thaliBowlImageReference.aspectRatioNote}`,
    },
    {
      label: "Format",
      value: "PNG, JPG, or WebP, optimized on upload. Use PNG with transparency for cut-out bowl shots.",
    },
    {
      label: "Framing",
      value:
        "Square crop with the product centered. For thali fallback, match the bowl reference above.",
    },
  ],
};

export type ThaliCategoryGroupId = "sweets" | "namkeens" | "bakery" | "gajak";

export type ThaliCategoryGroup = {
  id: ThaliCategoryGroupId;
  label: string;
  /**
   * A single slug resolvable by resolveCategorySlug/getProductsByCategory
   * (src/lib/catalog/aliases.ts, src/lib/catalog/queries.ts). "bakery" is
   * the virtual category already set up for the /catalogue/bakery nav page
   * (expands to cookies + dry-cakes server-side), reused here as-is.
   */
  categorySlug: string;
  icon: "candy" | "flame" | "wheat" | "crown";
};

/**
 * Item-picker cards shown below the plate, one per category, matching the
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
