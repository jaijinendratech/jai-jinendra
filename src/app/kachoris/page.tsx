import type { Metadata } from "next";
import { ExperienceCategoryView } from "@/components/experience/ExperienceCategoryView";
import { getProductsByCategory } from "@/data/catalogue";
import { kachorisPage } from "@/data/experience-pages";
import { getHeroCarouselContent } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: kachorisPage.metaTitle,
  description: kachorisPage.metaDescription,
  alternates: { canonical: "/kachoris" },
  openGraph: {
    title: kachorisPage.stitchTitle,
    description: kachorisPage.metaDescription,
  },
};

export default async function KachorisPage() {
  const products = getProductsByCategory("kachoris");
  const slides = await getHeroCarouselContent("kachoris");

  return (
    <ExperienceCategoryView
      config={kachorisPage}
      products={products}
      gridId="kachori-grid"
      slides={slides}
    />
  );
}
