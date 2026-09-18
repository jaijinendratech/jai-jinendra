import type { Metadata } from "next";
import { ComboBuilder } from "@/components/experience/combo-builder/ComboBuilder";
import { ComboBuilderHero } from "@/components/experience/combo-builder/ComboBuilderHero";
import { ComboBuilderSteps } from "@/components/experience/combo-builder/ComboBuilderSteps";
import { ComboBuilderTrustStrip } from "@/components/experience/combo-builder/ComboBuilderTrustStrip";
import { catalogueProducts } from "@/data/catalogue";
import { comboBuilderMeta, comboBuilderPoolIds } from "@/data/combo-builder";
import { getHeroCarouselContent } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: comboBuilderMeta.metaTitle,
  description: comboBuilderMeta.metaDescription,
  alternates: { canonical: "/combos" },
  openGraph: {
    title: comboBuilderMeta.stitchTitle,
    description: comboBuilderMeta.metaDescription,
  },
};

export default async function CombosPage() {
  const builderProducts = catalogueProducts.filter((product) =>
    (comboBuilderPoolIds as readonly string[]).includes(product.id),
  );
  const slides = await getHeroCarouselContent("combos");

  return (
    <>
      <ComboBuilderHero slides={slides} />
      <ComboBuilderSteps />
      <ComboBuilder products={builderProducts} />
      <ComboBuilderTrustStrip />
    </>
  );
}
