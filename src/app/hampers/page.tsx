import type { Metadata } from "next";
import { ExperienceCategoryView } from "@/components/experience/ExperienceCategoryView";
import { getProductsByCategory } from "@/data/catalogue";
import { hampersPage } from "@/data/experience-pages";
import { getHeroCarouselContent } from "@/lib/admin/queries";

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
  const products = getProductsByCategory("gifts");
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
