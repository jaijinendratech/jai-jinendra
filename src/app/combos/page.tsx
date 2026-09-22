import type { Metadata } from "next";
import { ComboBuilder } from "@/components/experience/combo-builder/ComboBuilder";
import { ComboBuilderHero } from "@/components/experience/combo-builder/ComboBuilderHero";
import { ComboBuilderSteps } from "@/components/experience/combo-builder/ComboBuilderSteps";
import { ComboBuilderTrustStrip } from "@/components/experience/combo-builder/ComboBuilderTrustStrip";
import { catalogueProducts } from "@/data/catalogue";
import { comboBuilderMeta, comboBuilderPoolIds } from "@/data/combo-builder";
import { getHeroCarouselContent } from "@/lib/admin/queries";
import { getPublishedProducts } from "@/lib/catalog/queries";
import { isSupabaseConfigured } from "@/lib/env";

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
  const allProducts = isSupabaseConfigured()
    ? await getPublishedProducts()
    : catalogueProducts.map((p) => ({
        ...p,
        category: { slug: String(p.category), title: String(p.category) },
        attributes: [],
        variants: p.variants.map((v) => ({
          id: v.variantId ?? v.id,
          label: v.label,
          price: v.price ?? p.price,
          sku: v.sku ?? `${p.slug}-${v.id}`,
          stockQty: v.stockQty ?? 0,
          available: true,
          variantId: v.variantId ?? v.id,
        })),
      }));
  const builderProducts = allProducts.filter((product) =>
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
