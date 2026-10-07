/** Admin-editable homepage "festive special" section (content_blocks: home / festive_special). */
export type FestiveSpecialContent = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonHref: string;
  /** Tag that marks products as part of this festival, e.g. "Navratri Special". */
  collectionTag: string;
  /** Hand-picked products, in display order. Empty = fall back to the tag rule. */
  productIds: string[];
};

export const FESTIVE_SPECIAL_DEFAULTS: FestiveSpecialContent = {
  enabled: true,
  eyebrow: "Fasting favourites",
  title: "Navratri Specials",
  subtitle:
    "Vrat-friendly falahaar, farali namkeens, and festive sweets for the nine nights.",
  buttonLabel: "Shop Navratri",
  buttonHref: "/catalogue",
  collectionTag: "",
  productIds: [],
};

export const FESTIVE_SPECIAL_MAX_PRODUCTS = 4;

const text = (v: unknown, fallback: string) =>
  typeof v === "string" ? v.trim() : fallback;

export function parseFestiveSpecial(raw: unknown): FestiveSpecialContent {
  const d = FESTIVE_SPECIAL_DEFAULTS;
  if (!raw || typeof raw !== "object") return d;
  const c = raw as Record<string, unknown>;
  return {
    enabled: c.enabled !== false,
    eyebrow: text(c.eyebrow, d.eyebrow),
    title: text(c.title, d.title) || d.title,
    subtitle: text(c.subtitle, d.subtitle),
    buttonLabel: text(c.buttonLabel, d.buttonLabel),
    buttonHref: text(c.buttonHref, d.buttonHref) || d.buttonHref,
    collectionTag: text(c.collectionTag, d.collectionTag),
    productIds: Array.isArray(c.productIds)
      ? c.productIds.filter((x): x is string => typeof x === "string")
      : [],
  };
}

/** A product tag counts as a festive collection when it ends in "Special" (e.g. "Diwali Special"). */
export function isFestiveTag(tag: string): boolean {
  return /special$/i.test(tag.trim());
}

export function festiveTagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
