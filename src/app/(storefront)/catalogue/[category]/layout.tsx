import {
  GAJAK_LISTING_SLUG,
  GAJAK_LISTING_TITLE,
  resolveCategorySlug,
  STOREFRONT_CATALOGUE_SECTIONS,
} from "@/lib/catalog/aliases";
import { categories } from "@/data/home";

function headingFor(raw: string): string {
  const resolved = resolveCategorySlug(raw);
  if (!resolved) return raw.replace(/-/g, " ");
  if (resolved === GAJAK_LISTING_SLUG) return GAJAK_LISTING_TITLE;
  const section = STOREFRONT_CATALOGUE_SECTIONS.find((item) => item.slug === resolved);
  if (section) return section.title;
  const match = categories.find((item) => item.id === resolved);
  return match?.title ?? resolved;
}

export default async function CatalogueCategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return (
    <>
      <h1 className="container-jj font-display pb-1 pt-6 text-2xl font-semibold text-on-surface md:pt-8 md:text-4xl">
        {headingFor(category)}
      </h1>
      {children}
    </>
  );
}
