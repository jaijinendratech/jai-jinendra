import type { Metadata } from "next";
import { ExperienceCategoryView } from "@/components/experience/ExperienceCategoryView";
import { kachorisPage } from "@/data/experience-pages";
import { getHeroCarouselContent } from "@/lib/admin/queries";
import { getProductsByCategory } from "@/lib/catalog/queries";
import { defaultOgImage } from "@/lib/seo";

export const metadata: Metadata = {
  title: kachorisPage.metaTitle,
  description: kachorisPage.metaDescription,
  alternates: { canonical: "/kachoris" },
  openGraph: {
    title: kachorisPage.stitchTitle,
    description: kachorisPage.metaDescription,
    images: [defaultOgImage],
  },
};

export default async function KachorisPage() {
  const products = await getProductsByCategory("kachoris");
  const slides = await getHeroCarouselContent("kachoris", { cached: true });

  return (
    <ExperienceCategoryView
      config={kachorisPage}
      products={products}
      gridId="kachori-grid"
      slides={slides}
    />
  );
}
