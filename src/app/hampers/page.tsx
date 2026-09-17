import type { Metadata } from "next";
import { ExperienceCategoryView } from "@/components/experience/ExperienceCategoryView";
import { getProductsByCategory } from "@/data/catalogue";
import { hampersPage } from "@/data/experience-pages";

export const metadata: Metadata = {
  title: hampersPage.metaTitle,
  description: hampersPage.metaDescription,
  alternates: { canonical: "/hampers" },
  openGraph: {
    title: hampersPage.stitchTitle,
    description: hampersPage.metaDescription,
  },
};

export default function HampersPage() {
  const products = getProductsByCategory("gifts");

  return (
    <ExperienceCategoryView
      config={hampersPage}
      products={products}
      gridId="hamper-grid"
    />
  );
}
