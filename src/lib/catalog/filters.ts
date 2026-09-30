import type { CatalogueFilterOption, Product } from "@/types/catalog";

const SPICE_LABELS: Record<string, string> = {
  mild: "Mild & Mellow",
  medium: "Medium Zesty",
  teekha: "Teekha / Hing",
  chatpata: "Chatpata Tangy",
};

export type CatalogueAttributeFilterGroup = {
  title: string;
  options: CatalogueFilterOption[];
};

/** Filter groups that have at least one value on the current product set. */
export function attributeFilterGroups(
  products: Product[],
): CatalogueAttributeFilterGroup[] {
  const groups = new Map<string, Map<string, { label: string; count: number }>>();

  function add(group: string, id: string, label: string) {
    let options = groups.get(group);
    if (!options) {
      options = new Map();
      groups.set(group, options);
    }
    const existing = options.get(id);
    if (existing) existing.count += 1;
    else options.set(id, { label, count: 1 });
  }

  for (const product of products) {
    const seen = new Set<string>();
    for (const attr of product.attributes ?? []) {
      if (!attr.filterable || !attr.filterGroup?.trim()) continue;
      const group = attr.filterGroup.trim();
      if (attr.dataType === "boolean") {
        if (attr.value !== true) continue;
        if (seen.has(attr.key)) continue;
        seen.add(attr.key);
        add(group, attr.key, attr.label);
      } else if (attr.dataType === "select") {
        const value = typeof attr.value === "string" ? attr.value.trim() : "";
        if (!value) continue;
        const id = `${attr.key}:${value}`;
        if (seen.has(id)) continue;
        seen.add(id);
        add(group, id, value);
      }
    }
  }

  return [...groups.entries()].map(([title, options]) => ({
    title,
    options: [...options.entries()].map(([id, option]) => ({
      id,
      label: option.label,
      count: option.count,
    })),
  }));
}

/** Spice notes present on the current product set. Empty when none are set. */
export function spiceFilterOptions(products: Product[]): CatalogueFilterOption[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    const note = product.spiceNote?.trim();
    if (!note) continue;
    counts.set(note, (counts.get(note) ?? 0) + 1);
  }
  return [...counts.entries()].map(([id, count]) => ({
    id,
    label: SPICE_LABELS[id] ?? id,
    count,
  }));
}

/** `?attr=<key>` for booleans, `?attr=<key>:<option>` for a chosen select value. */
export function productMatchesAttribute(
  product: Product,
  attr: string | null,
): boolean {
  if (!attr) return true;
  const splitAt = attr.indexOf(":");
  const key = splitAt === -1 ? attr : attr.slice(0, splitAt);
  const option = splitAt === -1 ? null : attr.slice(splitAt + 1);
  const found = product.attributes?.find((item) => item.key === key);
  if (!found) return false;
  if (option != null) {
    if (Array.isArray(found.value)) {
      return found.value.map(String).includes(option);
    }
    return String(found.value) === option;
  }
  return found.value === true;
}
