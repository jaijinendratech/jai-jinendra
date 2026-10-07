import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CataloguePageView } from "@/components/catalogue/CataloguePageView";
import { hrefWithSub } from "@/components/catalogue/CategoryPillRow";
import {
  catalogueMeta,
  cataloguePills,
  specialtyFilters,
} from "@/data/catalogue";
import {
  getCatalogueSpecialtyFilters,
  getCategoryListingProducts,
  getStorefrontCategoryChildren,
  isGajakCategoryPublished,
} from "@/lib/catalog/queries";
import {
  CATEGORY_ROUTE_ALIASES,
  dbSlugToCategoryId,
  GAJAK_LISTING_SLUG,
  GAJAK_LISTING_TITLE,
  resolveCategorySlug,
  STOREFRONT_CATALOGUE_SECTIONS,
} from "@/lib/catalog/aliases";
import { categories, siteConfig } from "@/data/home";
import type { CategoryId } from "@/types/catalog";

export const revalidate = 60;

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function readParam(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : null;
}

function categoryTitle(resolvedSlug: string): string {
  if (resolvedSlug === GAJAK_LISTING_SLUG) return GAJAK_LISTING_TITLE;

  const storefront = STOREFRONT_CATALOGUE_SECTIONS.find(
    (item) => item.slug === resolvedSlug,
  );
  if (storefront) return storefront.title;

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

export default async function CatalogueCategoryPage({
  params,
  searchParams,
}: Props) {
  const { category: raw } = await params;
  const resolved = resolveCategorySlug(raw);
  if (!resolved) notFound();
  if (resolved === GAJAK_LISTING_SLUG && !(await isGajakCategoryPublished())) {
    notFound();
  }

  const query = await searchParams;
  const requestedSub = readParam(query.sub);
  const [children, specialty] = await Promise.all([
    getStorefrontCategoryChildren(resolved),
    getCatalogueSpecialtyFilters(),
  ]);
  const activeSub =
    requestedSub && children.some((child) => child.slug === requestedSub)
      ? requestedSub
      : null;

  const products = await getCategoryListingProducts(resolved, activeSub);
  if (!activeSub && products.length === 0) notFound();

  const activeCategory = dbSlugToCategoryId(resolved) as CategoryId;
  const title = categoryTitle(resolved);
  const pathname = `/catalogue/${raw}`;
  const childPills =
    children.length === 0
      ? []
      : [
          {
            key: "all",
            label: "All",
            href: hrefWithSub(pathname, query, null),
            active: !activeSub,
          },
          ...children.map((child) => ({
            key: child.slug,
            label: child.title,
            href: hrefWithSub(pathname, query, child.slug),
            active: activeSub === child.slug,
          })),
        ];

  return (
    <CataloguePageView
      products={products}
      activeCategory={
        activeCategory === "combos" ? "tea-time-bites" : activeCategory
      }
      categoryTitle={title}
      childPills={childPills}
      activeCategorySlug={resolved}
      specialty={specialty}
    />
  );
}
