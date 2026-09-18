import type { Metadata } from "next";
import { ExperienceCategoryView } from "@/components/experience/ExperienceCategoryView";
import { getProductsByCategory } from "@/data/catalogue";
import { sweetsPage } from "@/data/experience-pages";
import { getHeroCarouselContent } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: sweetsPage.metaTitle,
  description: sweetsPage.metaDescription,
  alternates: { canonical: "/sweets" },
  openGraph: {
    title: sweetsPage.stitchTitle,
    description: sweetsPage.metaDescription,
  },
};

export default async function SweetsPage() {
  const products = getProductsByCategory("mithai");
  const slides = await getHeroCarouselContent("sweets");

  return (
    <ExperienceCategoryView
      config={sweetsPage}
      products={products}
      gridId="mithai-grid"
      slides={slides}
    />
  );
}
