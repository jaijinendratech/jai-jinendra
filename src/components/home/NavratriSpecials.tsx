import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LazyProductGrid } from "@/components/products/LazyProductGrid";
import type { Product } from "@/types/catalog";
import {
  FESTIVE_SPECIAL_MAX_PRODUCTS,
  type FestiveSpecialContent,
} from "@/lib/catalog/festive";

export function NavratriSpecials({
  products,
  content,
}: {
  products: Product[];
  content: FestiveSpecialContent;
}) {
  const visible = products.slice(0, FESTIVE_SPECIAL_MAX_PRODUCTS);
  if (!content.enabled || visible.length === 0) return null;

  return (
    <section
      id="navratri-specials"
      className="border-y border-[#EF6113]/20 bg-[#FFF4EC] py-8 md:py-20"
    >
      <div className="container-jj">
        <div className="mb-5 flex flex-col justify-between md:mb-8 md:flex-row md:items-end">
          <div>
            <span className="label-sm font-bold uppercase tracking-widest text-[#EF6113]">
              {content.eyebrow}
            </span>
            <h2 className="font-display mt-1 text-xl font-semibold text-on-surface md:text-[32px] md:leading-10">
              {content.title}
            </h2>
            {content.subtitle ? (
              <p className="mt-1 max-w-xl text-sm text-on-surface-variant md:text-base">
                {content.subtitle}
              </p>
            ) : null}
          </div>
          {content.buttonLabel ? (
            <Link
              href={content.buttonHref}
              className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#EF6113] px-4 py-1.5 text-xs font-semibold text-[#EF6113] transition-colors hover:bg-[#EF6113] hover:text-white md:mt-0"
            >
              {content.buttonLabel}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>

        <LazyProductGrid
          products={visible}
          priorityCount={0}
          className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-6 lg:grid-cols-4 lg:gap-7"
        />
      </div>
    </section>
  );
}
