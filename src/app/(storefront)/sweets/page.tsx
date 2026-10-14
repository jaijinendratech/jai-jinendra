import type { Metadata } from "next";
import { ExperienceCategoryView } from "@/components/experience/ExperienceCategoryView";
import { sweetsPage } from "@/data/experience-pages";
import { getHeroCarouselContent } from "@/lib/admin/queries";
import { getProductsByCategory } from "@/lib/catalog/queries";
import { defaultOgImage } from "@/lib/seo";

export const metadata: Metadata = {
  title: sweetsPage.metaTitle,
  description: sweetsPage.metaDescription,
  alternates: { canonical: "/sweets" },
  openGraph: {
    title: sweetsPage.stitchTitle,
    description: sweetsPage.metaDescription,
    images: [defaultOgImage],
  },
};

export default async function SweetsPage() {
  const products = await getProductsByCategory("mithai");
  const slides = await getHeroCarouselContent("sweets", { cached: true });

  return (
    <ExperienceCategoryView
      config={sweetsPage}
      products={products}
      gridId="mithai-grid"
      slides={slides}
    />
  );
}
