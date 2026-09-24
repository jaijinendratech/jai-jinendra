"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { LazyProductGrid } from "@/components/products/LazyProductGrid";
import { CatalogueGiftBanner } from "@/components/catalogue/CatalogueGiftBanner";
import { CatalogueQualityStrip } from "@/components/catalogue/CatalogueQualityStrip";
import { CataloguePagination } from "@/components/catalogue/CatalogueToolbar";
import { catalogueMeta } from "@/data/catalogue";
import type { Product } from "@/types/catalog";

function matchesPrice(product: Product, rangeId: string | null): boolean {
  if (!rangeId) return true;
  const price = product.price;
  switch (rangeId) {
    case "under-250":
      return price < 250;
    case "250-500":
      return price >= 250 && price <= 500;
    case "500-1000":
      return price >= 500 && price <= 1000;
    case "1000-plus":
      return price >= 1000;
    default:
      return true;
  }
}

export function FilterableCatalogueGrid({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const purity = searchParams.get("purity");
  const spice = searchParams.get("spice");
  const price = searchParams.get("price");

  const filtered = useMemo(() => {
    return products.filter((product) => {
      if (purity && !product.dietary?.includes(purity)) return false;
      if (spice && product.spiceNote !== spice) return false;
      if (!matchesPrice(product, price)) return false;
      return true;
    });
  }, [products, purity, spice, price]);

  return (
    <section className="space-y-8 lg:col-span-9">
      {(purity || spice || price) && filtered.length !== products.length ? (
        <p className="text-sm text-on-surface-variant">
          Showing {filtered.length} of {products.length} products
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-8 text-center text-sm text-on-surface-variant">
          No products match these filters.{" "}
          <a href="?" className="font-semibold text-primary hover:underline">
            Clear filters
          </a>
        </p>
      ) : (
        <LazyProductGrid
          products={filtered}
          initialCount={8}
          pageSize={8}
          priorityCount={4}
          midAfter={6}
          midSlot={<CatalogueGiftBanner />}
        />
      )}

      <CatalogueQualityStrip />
      <CataloguePagination
        shown={Math.min(filtered.length, filtered.length)}
        total={catalogueMeta.totalCount}
      />
    </section>
  );
}
