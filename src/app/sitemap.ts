import type { MetadataRoute } from "next";
import { preferredCataloguePath } from "@/lib/catalog/aliases";
import { getPublishedProducts } from "@/lib/catalog/queries";
import { getSiteUrl } from "@/lib/env";

const STATIC_PATHS = [
  "",
  "/catalogue",
  preferredCataloguePath("namkeen"),
  preferredCataloguePath("sweets"),
  preferredCataloguePath("kachoris"),
  preferredCataloguePath("gifting"),
  preferredCataloguePath("bakery"),
  preferredCataloguePath("gajak"),
  "/catering",
  "/sweets",
  "/kachoris",
  "/hampers",
  "/combos",
  "/about",
  "/achievement",
  "/heritage",
  "/purity",
  "/freshness",
  "/outlets",
  "/corporate",
  "/contact",
  "/support",
  "/track-order",
  "/shipping-returns",
  "/refund-return-policy",
  "/terms",
  "/terms-privacy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const products = await getPublishedProducts();

  const staticRoutes = [...new Set(STATIC_PATHS)].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path.startsWith("/products") ? 0.8 : 0.7,
  }));

  const productRoutes = products.map((product) => ({
    url: `${base}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
