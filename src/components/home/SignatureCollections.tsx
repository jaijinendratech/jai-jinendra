import Link from "next/link";
import type { Product } from "@/types/catalog";
import { LazyProductGrid } from "@/components/products/LazyProductGrid";
import { categoryHref } from "@/lib/catalog/aliases";

/** Landing-page gifting section, fed live from the gifting category. */
export function SignatureCollections({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section id="combos" className="bg-surface py-8 md:py-20">
      <div className="container-jj">
        <div className="mb-5 max-w-2xl md:mb-10">
          <span className="label-sm font-bold uppercase tracking-widest text-primary">
            <span className="md:hidden">Signature Sets</span>
            <span className="hidden md:inline">Curated Connoisseur Sets</span>
          </span>
          <h2 className="font-display mt-1 text-xl font-semibold text-on-surface md:text-[32px] md:leading-10">
            <span className="md:hidden">Our Signatures</span>
            <span className="hidden md:inline">THE JAI JINENDRA SIGNATURES</span>
          </h2>
          <p className="mt-1.5 text-sm text-on-surface-variant md:mt-2 md:text-base">
            <span className="md:hidden">Heritage tins & curated gift sets.</span>
            <span className="hidden md:inline">
              Bespoke regional combinations packed in collectible heritage tin
              canisters and gold-stamped cases.
            </span>
          </p>
        </div>

        <LazyProductGrid
          products={products}
          priorityCount={0}
          className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-6 lg:grid-cols-4 lg:gap-7"
        />

        <div className="mt-6 text-center md:mt-10">
          <Link
            href={categoryHref("gifting")}
            className="inline-flex items-center justify-center rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            View all gifting
          </Link>
        </div>
      </div>
    </section>
  );
}
