import { Suspense } from "react";
import { CatalogueFilters } from "@/components/catalogue/CatalogueFilters";
import { CatalogueHero } from "@/components/catalogue/CatalogueHero";
import {
  CategoryPillRow,
  type CategoryPill,
} from "@/components/catalogue/CategoryPillRow";
import { CatalogueSections } from "@/components/catalogue/CatalogueSections";
import { CatalogueToolbar } from "@/components/catalogue/CatalogueToolbar";
import { FilterableCatalogueGrid } from "@/components/catalogue/FilterableCatalogueGrid";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import {
  catalogueMeta,
  cataloguePills,
  priceRanges,
  purityFilters,
  specialtyFilters,
  spiceFilters,
} from "@/data/catalogue";
import type { CatalogueSection } from "@/lib/catalog/queries";
import type { CategoryId, Product } from "@/types/catalog";

export function CataloguePageView({
  products = [],
  activeCategory,
  categoryTitle,
  childPills = [],
  sections,
}: {
  products?: Product[];
  activeCategory: CategoryId | "all";
  categoryTitle?: string;
  childPills?: CategoryPill[];
  sections?: CatalogueSection[];
}) {
  const overview = Boolean(sections);

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

      <CatalogueHero
        title={categoryTitle ? categoryTitle : catalogueMeta.title}
        eyebrow={catalogueMeta.eyebrow}
        description={catalogueMeta.description}
        mobileTitle={categoryTitle ? categoryTitle : catalogueMeta.mobileTitle}
        mobileEyebrow={catalogueMeta.mobileEyebrow}
        mobileDescription={catalogueMeta.mobileDescription}
        pills={cataloguePills}
        activeCategory={activeCategory}
        showBakeryMarks={activeCategory === "bakery"}
      />

      {overview && sections ? (
        <CatalogueSections sections={sections} />
      ) : (
        <>
          <CategoryPillRow
            label={`${categoryTitle ?? "Category"} sections`}
            pills={childPills}
            className="mb-6"
          />

          <CatalogueToolbar
            shown={products.length}
            total={catalogueMeta.totalCount}
            freshnessNote={catalogueMeta.freshnessNote}
          />

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <Suspense fallback={null}>
              <CatalogueFilters
                specialty={specialtyFilters}
                purity={purityFilters}
                spice={spiceFilters}
                prices={priceRanges}
                activeCategory={activeCategory}
                warranty={catalogueMeta.warranty}
              />
            </Suspense>

            <Suspense fallback={<p className="lg:col-span-9 text-sm text-on-surface-variant">Loading…</p>}>
              <FilterableCatalogueGrid products={products} />
            </Suspense>
          </div>
        </>
      )}
    </main>
  );
}
