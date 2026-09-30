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
              <span className="md:hidden">
                Something delicious for every craving.
              </span>
              <span className="hidden md:inline">
                Something delicious for every craving, tea time, and festive
                celebration.
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

        {/* Unified horizontal scroll for all devices */}
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-4 md:mx-0 md:gap-6 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative flex w-[22vw] max-w-25 shrink-0 flex-col items-center gap-2 md:w-[15vw] md:max-w-37.5 md:gap-3"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-full bg-surface-container-low shadow-sm transition-shadow duration-300 group-hover:shadow-md">
                <Image
                  src={category.image}
                  alt={category.imageAlt}
                  fill
                  sizes="(max-width: 768px) 22vw, 15vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="text-center text-[11px] font-bold leading-tight text-on-surface transition-colors group-hover:text-primary sm:text-xs md:text-sm">
                {category.mobileTitle ?? category.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
