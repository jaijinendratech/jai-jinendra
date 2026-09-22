import type { Metadata } from "next";
import { CataloguePageView } from "@/components/catalogue/CataloguePageView";
import { catalogueMeta } from "@/data/catalogue";
import { getPublishedProducts } from "@/lib/catalog/queries";
import { siteConfig } from "@/data/home";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Full Product Catalogue",
  description: catalogueMeta.description,
  alternates: { canonical: "/catalogue" },
  openGraph: {
    title: `Full Product Catalogue | ${siteConfig.name}`,
    description: catalogueMeta.description,
    url: `${siteConfig.url}/catalogue`,
  },
};

export default async function CataloguePage() {
  const products = await getPublishedProducts();
  return <CataloguePageView products={products} activeCategory="all" />;
}
