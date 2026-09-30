import { BakeryDietaryMarks } from "@/components/catalogue/BakeryDietaryMarks";
import { CategoryPillRow } from "@/components/catalogue/CategoryPillRow";
import { ProductCard } from "@/components/products/ProductCard";
import type { CatalogueSection } from "@/lib/catalog/queries";

export function CatalogueSections({
  sections,
}: {
  sections: CatalogueSection[];
}) {
  return (
    <div className="space-y-12 pb-10">
      {sections.map((section) => {
        const pills = [
          ...section.children.map((child) => ({
            key: child.slug,
            label: child.title,
            href: `/catalogue/${section.slug}?sub=${encodeURIComponent(child.slug)}`,
          })),
          {
            key: `${section.slug}-more`,
            label: "See More",
            href: `/catalogue/${section.slug}`,
            tone: "action" as const,
          },
        ];

        return (
          <section
            key={section.slug}
            aria-labelledby={`catalogue-${section.slug}`}
            className="border-t border-outline-variant/20 pt-8"
          >
            <h2
              id={`catalogue-${section.slug}`}
              className="font-display text-2xl font-bold text-primary md:text-[28px]"
            >
              {section.title}
            </h2>
            {section.showBakeryMarks ? (
              <BakeryDietaryMarks className="mt-3" />
            ) : null}
            <CategoryPillRow
              label={`${section.title} categories`}
              pills={pills}
              className="mt-4 mb-5"
            />
            {section.products.length === 0 ? (
              <p className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6 text-sm text-on-surface-variant">
                No products in this collection yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">
                {section.products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={section.slug === "sweets" && index === 0}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
