import { Suspense } from "react";
import { CatalogueFilters } from "@/components/catalogue/CatalogueFilters";
import { CatalogueHero } from "@/components/catalogue/CatalogueHero";
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
import type { CategoryId, Product } from "@/types/catalog";

export function CataloguePageView({
  products,
  activeCategory,
  categoryTitle,
}: {
  products: Product[];
  activeCategory: CategoryId | "all";
  categoryTitle?: string;
}) {
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
