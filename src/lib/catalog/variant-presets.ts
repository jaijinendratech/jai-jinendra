import type { SellingUnit } from "@/types/catalog";

export type VariantPresetRow = {
  label: string;
  sellingUnit: SellingUnit;
  quantityValue: number | null;
  sortOrder: number;
};

/** UX helpers keyed by category slug, with an optional subcategory override. */
export function variantPresetsForCategory(
  categorySlug: string,
  subcategorySlug?: string | null,
): VariantPresetRow[] {
  const slug = categorySlug.toLowerCase();
  const sub = subcategorySlug?.trim().toLowerCase() ?? "";

  if ((slug === "sweets" || slug === "mithai") && sub === "gajak") {
    return [
      { label: "500 GM", sellingUnit: "g", quantityValue: 500, sortOrder: 0 },
      { label: "1 KG", sellingUnit: "kg", quantityValue: 1, sortOrder: 1 },
    ];
  }

  if (slug === "sweets" || slug === "mithai") {
    // 250 GM stays. Gajak under sweets uses the subcategory branch above.
    return [
      { label: "250 GM", sellingUnit: "g", quantityValue: 250, sortOrder: 0 },
      { label: "500 GM", sellingUnit: "g", quantityValue: 500, sortOrder: 1 },
      { label: "1 KG", sellingUnit: "kg", quantityValue: 1, sortOrder: 2 },
    ];
  }

  if (slug === "namkeen" || slug === "namkeens") {
    return [
      { label: "250 GM", sellingUnit: "g", quantityValue: 250, sortOrder: 0 },
      { label: "500 GM", sellingUnit: "g", quantityValue: 500, sortOrder: 1 },
      { label: "1 KG", sellingUnit: "kg", quantityValue: 1, sortOrder: 2 },
      { label: "PACK", sellingUnit: "pack", quantityValue: null, sortOrder: 3 },
    ];
  }

  if (slug === "bakery") {
    return [
      { label: "250 GM", sellingUnit: "g", quantityValue: 250, sortOrder: 0 },
      { label: "500 GM", sellingUnit: "g", quantityValue: 500, sortOrder: 1 },
      { label: "1 KG", sellingUnit: "kg", quantityValue: 1, sortOrder: 2 },
      { label: "PACK", sellingUnit: "pack", quantityValue: null, sortOrder: 3 },
      { label: "PC", sellingUnit: "pc", quantityValue: null, sortOrder: 4 },
    ];
  }

  if (slug === "tea-time-bites" || slug === "tea-time") {
    return [{ label: "PACK", sellingUnit: "pack", quantityValue: null, sortOrder: 0 }];
  }

  if (slug === "dry-cakes") {
    return [{ label: "PC", sellingUnit: "pc", quantityValue: null, sortOrder: 0 }];
  }

  if (slug === "cookies") {
    return [
      { label: "250 GM", sellingUnit: "g", quantityValue: 250, sortOrder: 0 },
      { label: "500 GM", sellingUnit: "g", quantityValue: 500, sortOrder: 1 },
    ];
  }

  if (slug === "gajak") {
    // Legacy top-level gajak category, if it is still selected in admin.
    return [
      { label: "500 GM", sellingUnit: "g", quantityValue: 500, sortOrder: 0 },
      { label: "1 KG", sellingUnit: "kg", quantityValue: 1, sortOrder: 1 },
    ];
  }

  if (slug === "gifting" || slug === "gifts") {
    return [
      { label: "PACK", sellingUnit: "pack", quantityValue: null, sortOrder: 0 },
      { label: "PC", sellingUnit: "pc", quantityValue: null, sortOrder: 1 },
    ];
  }

  return [];
}
