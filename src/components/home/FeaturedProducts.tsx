"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { productFilters } from "@/data/home";
import type { Product } from "@/types/catalog";

type FeaturedProductsProps = {
  products: Product[];
};

export function FeaturedProducts({ products: allProducts }: FeaturedProductsProps) {
  const [filter, setFilter] = useState<(typeof productFilters)[number]["id"]>("all");

  const products = useMemo(() => {
    if (filter === "all") return allProducts;
    if (filter === "gifts") {
      return allProducts.filter((p) => p.category === "gifts" || p.badge?.includes("Royal"));
    }
    return allProducts.filter((p) => p.category === filter);
  }, [allProducts, filter]);

  return (
    <section
      id="bestsellers"
      className="border-y border-outline-variant/30 bg-surface-container-low py-8 md:py-20"
    >
      <div className="container-jj">
        <div className="mb-5 flex flex-col justify-between md:mb-8 md:flex-row md:items-end">
          <div>
            <span className="label-sm font-bold uppercase tracking-widest text-primary">
              <span className="md:hidden">Most Ordered</span>
              <span className="hidden md:inline">Most Ordered Across India</span>
            </span>
            <h2 className="font-display mt-1 text-xl font-semibold text-on-surface md:text-[32px] md:leading-10">
              <span className="md:hidden">Favourites</span>
              <span className="hidden md:inline">CUSTOMER FAVOURITES</span>
            </h2>
          </div>
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 md:mt-0 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {productFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors md:px-4 ${
                  filter === item.id
                    ? "bg-primary-container text-white shadow-sm"
                    : "border border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:text-primary"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-6 lg:grid-cols-4 lg:gap-7">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              href={`/products/${product.slug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
