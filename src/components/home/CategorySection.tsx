import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types/catalog";

export function CategorySection({ categories }: { categories: Category[] }) {
  return (
    <section id="categories" className="bg-surface py-8 md:py-20">
      <div className="container-jj">
        <div className="mb-5 flex flex-col justify-between border-b border-outline-variant/30 pb-3 md:mb-10 md:flex-row md:items-end md:pb-4">
          <div>
            <span className="label-sm font-bold uppercase tracking-widest text-primary">
              Artisanal Variety
            </span>
            <h2 className="font-display mt-1 text-xl font-semibold text-on-surface md:text-[32px] md:leading-10">
              <span className="md:hidden">Our Favourites</span>
              <span className="hidden md:inline">EXPLORE OUR FAVOURITES</span>
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant md:text-base">
              <span className="md:hidden">Something delicious for every craving.</span>
              <span className="hidden md:inline">
                Something delicious for every craving, tea time, and festive celebration.
              </span>
            </p>
          </div>
          <Link
            href="/catalogue"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline md:mt-0"
          >
            <span className="md:hidden">Shop Now</span>
            <span className="hidden md:inline">View full catalogue</span>{" "}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile: horizontal scroll of visual cards */}
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="culinary-lift group block w-[42vw] max-w-40 shrink-0 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-2"
            >
              <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-surface-container-low">
                <Image
                  src={category.image}
                  alt={category.imageAlt}
                  fill
                  sizes="42vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="truncate text-sm font-semibold text-on-surface transition-colors group-hover:text-primary">
                {category.mobileTitle ?? category.title}
              </h3>
              <p className="text-[11px] text-on-surface-variant">{category.subtitle}</p>
            </Link>
          ))}
        </div>

        {/* Tablet/desktop grid */}
        <div className="hidden grid-cols-2 gap-4 md:grid md:grid-cols-3 md:gap-5 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="culinary-lift group block rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3"
            >
              <div className="relative mb-3 aspect-5/6 overflow-hidden rounded-lg bg-surface-container-low">
                <Image
                  src={category.image}
                  alt={category.imageAlt}
                  fill
                  sizes="(max-width:1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="text-base font-semibold text-on-surface transition-colors group-hover:text-primary">
                {category.title}
              </h3>
              <p className="text-xs text-on-surface-variant">{category.subtitle}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
