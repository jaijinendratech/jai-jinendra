import type { Metadata } from "next";
import { ExperienceCategoryView } from "@/components/experience/ExperienceCategoryView";
import { hampersPage } from "@/data/experience-pages";
import { getHeroCarouselContent } from "@/lib/admin/queries";
import { getProductsByCategory } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: hampersPage.metaTitle,
  description: hampersPage.metaDescription,
  alternates: { canonical: "/hampers" },
  openGraph: {
    title: hampersPage.stitchTitle,
    description: hampersPage.metaDescription,
  },
};

export default async function HampersPage() {
  const products = await getProductsByCategory("gifts");
  const slides = await getHeroCarouselContent("hampers");

  return (
    <ExperienceCategoryView
      config={hampersPage}
      products={products}
      gridId="hamper-grid"
      slides={slides}
    />
  );
}
