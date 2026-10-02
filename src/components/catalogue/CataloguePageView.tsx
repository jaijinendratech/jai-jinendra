import { Suspense } from "react";
import { CatalogueFilters } from "@/components/catalogue/CatalogueFilters";
import {
  CategoryPillRow,
  type CategoryPill,
} from "@/components/catalogue/CategoryPillRow";
import { CatalogueSections } from "@/components/catalogue/CatalogueSections";
import { PuritySealCertification } from "@/components/catalogue/PuritySealCertification";
import { FilterableCatalogueGrid } from "@/components/catalogue/FilterableCatalogueGrid";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { bakeryUspBadges, namkeenUspBadges, priceRanges } from "@/data/catalogue";
import type {
  CatalogueSection,
  CatalogueSpecialtyFilter,
} from "@/lib/catalog/queries";
import type { CategoryId, Product } from "@/types/catalog";

export function CataloguePageView({
  products = [],
  activeCategory,
  activeCategorySlug = "",
  categoryTitle,
  childPills = [],
  sections,
  specialty = [],
}: {
  products?: Product[];
  activeCategory: CategoryId | "all";
  activeCategorySlug?: string;
  categoryTitle?: string;
  childPills?: CategoryPill[];
  sections?: CatalogueSection[];
  specialty?: CatalogueSpecialtyFilter[];
}) {
  const overview = Boolean(sections);
  const uspBadges =
    activeCategorySlug === "bakery"
      ? bakeryUspBadges
      : activeCategorySlug === "namkeen"
        ? namkeenUspBadges
        : null;

  return (
    <main className="container-jj py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Collections", href: "/catalogue" },
          {
            label: categoryTitle ?? "All Authentic Namkeens & Delicacies",
          },
        ]}
      />

      {uspBadges ? <PuritySealCertification items={uspBadges} /> : null}

      {overview && sections ? (
        <CatalogueSections sections={sections} />
      ) : (
        <>
          <CategoryPillRow
            label={`${categoryTitle ?? "Category"} sections`}
            pills={childPills}
            className="mb-6"
          />

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <Suspense fallback={null}>
              <CatalogueFilters
                specialty={specialty}
                products={products}
                prices={priceRanges}
                activeSlug={activeCategorySlug || String(activeCategory)}
              />
            </Suspense>

            <Suspense
              fallback={
                <p className="lg:col-span-9 text-sm text-on-surface-variant">
                  Loading…
                </p>
              }
            >
              <FilterableCatalogueGrid products={products} />
            </Suspense>
          </div>
        </>
      )}
    </main>
  );
}
