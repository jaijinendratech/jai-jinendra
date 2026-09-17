import type { Metadata } from "next";
import { ExperienceCategoryView } from "@/components/experience/ExperienceCategoryView";
import { getProductsByCategory } from "@/data/catalogue";
import { kachorisPage } from "@/data/experience-pages";

export const metadata: Metadata = {
  title: kachorisPage.metaTitle,
  description: kachorisPage.metaDescription,
  alternates: { canonical: "/kachoris" },
  openGraph: {
    title: kachorisPage.stitchTitle,
    description: kachorisPage.metaDescription,
  },
};

export default function KachorisPage() {
  const products = getProductsByCategory("kachoris");

  return (
    <ExperienceCategoryView
      config={kachorisPage}
      products={products}
      gridId="kachori-grid"
    />
  );
}
