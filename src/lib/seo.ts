import { getSiteUrl } from "@/lib/env";

/** Collapse CMS HTML into a single line suitable for meta descriptions and schema. */
export function plainText(value: string | null | undefined, max = 160): string {
  const text = (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Absolute https URL for a site path or an already-absolute asset. */
export function absoluteUrl(src: string): string {
  if (!src) return getSiteUrl();
  if (src.startsWith("https://") || src.startsWith("http://")) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${getSiteUrl()}${path}`;
}

export const defaultOgImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Jai Jinendra Sweets & Namkeens — Rajasthani namkeens and mithai since 1984",
};

export function productInStock(variants: { available?: boolean; stockQty?: number }[]): boolean {
  if (variants.length === 0) return true;
  return variants.some(
    (variant) => variant.available !== false && (variant.stockQty ?? 1) > 0,
  );
}
