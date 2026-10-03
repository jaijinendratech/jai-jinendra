import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LazyProductGrid } from "@/components/products/LazyProductGrid";
import type { Product } from "@/types/catalog";

export function FeaturedProducts({ products }: { products: Product[] }) {
  const visible = products.slice(0, 4);

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
          <Link
            href="/catalogue"
            className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary-container px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-container hover:text-white md:mt-0"
          >
            See More
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <LazyProductGrid
          products={visible}
          priorityCount={4}
          className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-6 lg:grid-cols-4 lg:gap-7"
        />
      </div>
    </section>
  );
}
