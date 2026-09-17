import type { Metadata } from "next";
import { ExperienceCategoryView } from "@/components/experience/ExperienceCategoryView";
import { getProductsByCategory } from "@/data/catalogue";
import { sweetsPage } from "@/data/experience-pages";

export const metadata: Metadata = {
  title: sweetsPage.metaTitle,
  description: sweetsPage.metaDescription,
  alternates: { canonical: "/sweets" },
  openGraph: {
    title: sweetsPage.stitchTitle,
    description: sweetsPage.metaDescription,
  },
};

export default function SweetsPage() {
  const products = getProductsByCategory("mithai");

  return (
    <ExperienceCategoryView
      config={sweetsPage}
      products={products}
      gridId="mithai-grid"
    />
  );
}
