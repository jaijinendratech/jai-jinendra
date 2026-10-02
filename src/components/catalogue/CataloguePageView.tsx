import { Suspense } from "react";
import { CatalogueFilters } from "@/components/catalogue/CatalogueFilters";
import { CatalogueHero } from "@/components/catalogue/CatalogueHero";
import { CatalogueToolbar } from "@/components/catalogue/CatalogueToolbar";
import { CategoryUspBadges } from "@/components/catalogue/CategoryUspBadges";
import { FilterableCatalogueGrid } from "@/components/catalogue/FilterableCatalogueGrid";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import {
  bakeryUspBadges,
  catalogueMeta,
  cataloguePills,
  namkeenUspBadges,
  priceRanges,
  purityFilters,
  specialtyFilters,
  spiceFilters,
} from "@/data/catalogue";
import type { CategoryId, Product } from "@/types/catalog";

export function CataloguePageView({
  products,
  activeCategory,
  categoryTitle,
  categorySlug,
}: {
  products: Product[];
  activeCategory: CategoryId | "all";
  categoryTitle?: string;
  /** Raw resolved category slug (e.g. "bakery"); used for category-specific extras. */
  categorySlug?: string;
}) {
  const uspBadges =
    categorySlug === "bakery"
      ? bakeryUspBadges
      : categorySlug === "namkeen"
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

      <CatalogueHero
        title={categoryTitle ? categoryTitle : catalogueMeta.title}
        eyebrow={catalogueMeta.eyebrow}
        description={catalogueMeta.description}
        mobileTitle={categoryTitle ? categoryTitle : catalogueMeta.mobileTitle}
        mobileEyebrow={catalogueMeta.mobileEyebrow}
        mobileDescription={catalogueMeta.mobileDescription}
        pills={cataloguePills}
        activeCategory={activeCategory}
      />

      {uspBadges ? (
        <CategoryUspBadges
          items={uspBadges}
          ariaLabel={`${categoryTitle ?? "Category"} highlights`}
        />
      ) : null}

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
    </main>
  );
}
