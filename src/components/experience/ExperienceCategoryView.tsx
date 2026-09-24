import Link from "next/link";
import { LazyProductGrid } from "@/components/products/LazyProductGrid";
import { CatalogueQualityStrip } from "@/components/catalogue/CatalogueQualityStrip";
import { PageHeroCarousel } from "@/components/shared/PageHeroCarousel";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import type {
  ExperiencePageConfig,
  ExperienceSlide,
} from "@/data/experience-pages";
import type { Product } from "@/types/catalog";

export function ExperienceCategoryView({
  config,
  products,
  gridId,
  slides,
}: {
  config: ExperiencePageConfig;
  products: Product[];
  gridId: string;
  /** Optional CMS slides; falls back to config.slides. */
  slides?: readonly ExperienceSlide[];
}) {
  const carouselSlides = slides?.length ? slides : config.slides;

  return (
    <>
      <PageHeroCarousel
        slides={carouselSlides}
        label={`${config.h1} highlights`}
        showNavButtons={false}
        compactMobile
      />

      <main className="container-jj py-4 md:py-10">
        <div className="hidden md:block">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: config.h1 }]}
          />
        </div>

        <section
          id={gridId}
          className="mt-2 scroll-mt-24 md:mt-12 md:scroll-mt-28"
        >
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 md:mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                <span className="md:hidden">{config.eyebrow}</span>
                <span className="hidden md:inline">Curated selection</span>
              </p>
              <h2 className="font-display mt-1 text-xl font-semibold text-on-surface md:text-3xl">
                <span className="md:hidden">{config.h1}</span>
                <span className="hidden md:inline">Shop this collection</span>
              </h2>
            </div>
            <Link
              href={`/catalogue/${config.category === "mithai" ? "mithai" : config.category === "gifts" ? "gifts" : config.category}`}
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              <span className="md:hidden">Full catalogue</span>
              <span className="hidden md:inline">View full catalogue filter</span>
            </Link>
          </div>

          {products.length > 0 ? (
            <LazyProductGrid
              products={products}
              initialCount={8}
              pageSize={8}
              priorityCount={4}
              className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3"
            />
          ) : (
            <p className="rounded-lg border border-dashed border-outline-variant/40 bg-surface-container-low p-6 text-sm text-on-surface-variant md:p-8">
              Products for this collection are being refreshed. Browse the{" "}
              <Link
                href="/catalogue"
                className="font-semibold text-primary underline"
              >
                full catalogue
              </Link>{" "}
              meanwhile.
            </p>
          )}
        </section>

        <CatalogueQualityStrip />
      </main>
    </>
  );
}
