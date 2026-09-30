/** Labels that stay in sync with the existing boolean product columns. */
export const MERCHANDISING_TAGS = [
  "Featured",
  "Bestseller",
  "New arrival",
  "Seasonal",
] as const;

export const DEFAULT_SHIPPING_TITLE = "Pan-India Express";
export const DEFAULT_SHIPPING_NOTE = "Dispatched in 24 hrs • Free above ₹999";

function hasTag(tags: string[], label: string): boolean {
  const needle = label.trim().toLowerCase();
  return tags.some((tag) => tag.trim().toLowerCase() === needle);
}

export function tagFlags(tags: string[]) {
  return {
    featured: hasTag(tags, "Featured"),
    bestseller: hasTag(tags, "Bestseller"),
    new_arrival: hasTag(tags, "New arrival"),
    seasonal: hasTag(tags, "Seasonal"),
  };
}

export function tagsFromFlags(flags: {
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  seasonal?: boolean;
  badge?: string | null;
  tags?: string[] | null;
}): string[] {
  if (flags.tags != null) return flags.tags;
  const tags: string[] = [];
  if (flags.featured) tags.push("Featured");
  if (flags.bestseller) tags.push("Bestseller");
  if (flags.newArrival) tags.push("New arrival");
  if (flags.seasonal) tags.push("Seasonal");
  const badge = flags.badge?.trim();
  if (badge && !hasTag(tags, badge)) tags.push(badge);
  return tags;
}

export function productTagLabels(product: {
  tags?: string[] | null;
  badge?: string | null;
}): string[] {
  const tags = (product.tags ?? []).map((tag) => tag.trim()).filter(Boolean);
  if (tags.length) return tags;
  const badge = product.badge?.trim();
  return badge ? [badge] : [];
}
