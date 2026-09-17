import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { getPublishedProducts } from "@/lib/catalog/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const products = await getPublishedProducts();

  const staticRoutes = [
    "",
    "/catalogue",
    "/catalogue/namkeens",
    "/catalogue/mithai",
    "/catalogue/kachoris",
    "/catalogue/gifts",
    "/sweets",
    "/kachoris",
    "/hampers",
    "/combos",
    "/about",
    "/heritage",
    "/purity",
    "/freshness",
    "/outlets",
    "/corporate",
    "/support",
    "/track-order",
    "/shipping-returns",
    "/terms-privacy",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const productRoutes = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
