import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CataloguePageView } from "@/components/catalogue/CataloguePageView";
import {
  catalogueMeta,
  cataloguePills,
  specialtyFilters,
} from "@/data/catalogue";
import { getProductsByCategory } from "@/lib/catalog/queries";
import {
  CATEGORY_ROUTE_ALIASES,
  dbSlugToCategoryId,
  resolveCategorySlug,
} from "@/lib/catalog/aliases";
import { categories, siteConfig } from "@/data/home";
import type { CategoryId } from "@/types/catalog";

export const revalidate = 60;

type Props = {
  params: Promise<{ category: string }>;
};

function categoryTitle(resolvedSlug: string): string {
  const categoryId = dbSlugToCategoryId(resolvedSlug);
  const fromHome = categories.find((item) => item.id === categoryId);
  if (fromHome) return fromHome.title;
  const fromPill = cataloguePills.find((item) => item.id === categoryId);
  if (fromPill) return fromPill.label;
  const fromFilter = specialtyFilters.find((item) => item.id === categoryId);
  return fromFilter?.label ?? resolvedSlug;
}

export async function generateStaticParams() {
  return CATEGORY_ROUTE_ALIASES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: raw } = await params;
  const resolved = resolveCategorySlug(raw);
  if (!resolved) return { title: "Catalogue" };

  const title = categoryTitle(resolved);
  return {
    title,
    description: `Shop ${title} from ${siteConfig.name}. ${catalogueMeta.description}`,
    alternates: { canonical: `/catalogue/${raw}` },
  };
}

export default async function CatalogueCategoryPage({ params }: Props) {
  const { category: raw } = await params;
  const resolved = resolveCategorySlug(raw);
  if (!resolved) notFound();

  const products = await getProductsByCategory(resolved);
  if (products.length === 0) notFound();

  const activeCategory = dbSlugToCategoryId(resolved) as CategoryId;

  return (
    <CataloguePageView
      products={products}
      activeCategory={activeCategory === "combos" ? "tea-time-bites" : activeCategory}
      categoryTitle={categoryTitle(resolved)}
    />
  );
}
