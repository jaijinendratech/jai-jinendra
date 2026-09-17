import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CataloguePageView } from "@/components/catalogue/CataloguePageView";
import {
  catalogueMeta,
  cataloguePills,
  specialtyFilters,
} from "@/data/catalogue";
import { getProductsByCategory } from "@/lib/catalog/queries";
import { categories, siteConfig } from "@/data/home";
import type { CategoryId } from "@/types/catalog";

const validCategories: CategoryId[] = [
  "namkeens",
  "kachoris",
  "mithai",
  "gifts",
  "tea-time",
  "dry-fruits",
  "combos",
];

type Props = {
  params: Promise<{ category: string }>;
};

function resolveCategory(raw: string): CategoryId | null {
  if (raw === "sweets") return "mithai";
  if (raw === "hampers") return "gifts";
  if (raw === "snacks") return "tea-time";
  if (validCategories.includes(raw as CategoryId)) return raw as CategoryId;
  return null;
}

function categoryTitle(category: CategoryId) {
  const fromHome = categories.find((item) => item.id === category);
  if (fromHome) return fromHome.title;
  const fromPill = cataloguePills.find((item) => item.id === category);
  if (fromPill) return fromPill.label;
  const fromFilter = specialtyFilters.find((item) => item.id === category);
  return fromFilter?.label ?? category;
}

export async function generateStaticParams() {
  return [
    ...validCategories.map((category) => ({ category })),
    { category: "sweets" },
    { category: "hampers" },
    { category: "snacks" },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: raw } = await params;
  const category = resolveCategory(raw);
  if (!category) return { title: "Catalogue" };

  const title = categoryTitle(category);
  return {
    title,
    description: `Shop ${title} from ${siteConfig.name}. ${catalogueMeta.description}`,
    alternates: { canonical: `/catalogue/${raw}` },
  };
}

export default async function CatalogueCategoryPage({ params }: Props) {
  const { category: raw } = await params;
  const category = resolveCategory(raw);
  if (!category) notFound();

  const products = await getProductsByCategory(category);
  if (products.length === 0) notFound();

  return (
    <CataloguePageView
      products={products}
      activeCategory={category === "combos" ? "tea-time" : category}
      categoryTitle={categoryTitle(category)}
    />
  );
}
