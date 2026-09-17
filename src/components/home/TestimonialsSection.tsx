import { BadgeCheck, Star } from "lucide-react";
import type { Testimonial } from "@/types/catalog";

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <blockquote className="flex h-full flex-col rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 md:p-6">
      <div className="mb-3 flex gap-1 md:mb-4" aria-label={`${item.rating} out of 5 stars`}>
        {Array.from({ length: item.rating }).map((_, i) => (
          <Star
            key={i}
            className="h-3.5 w-3.5 fill-amber-rating text-amber-rating md:h-4 md:w-4"
            aria-hidden
          />
        ))}
      </div>
      <p className="text-sm leading-6 text-on-surface-variant md:leading-7">
        <span className="md:hidden">“{item.mobileQuote ?? item.quote}”</span>
        <span className="hidden md:inline">“{item.quote}”</span>
      </p>
      <footer className="mt-4 flex items-center justify-between gap-3 md:mt-5">
        <div>
          <cite className="not-italic text-sm font-semibold text-on-surface md:text-base">
            {item.name}
          </cite>
          <p className="text-[11px] text-on-surface-variant md:text-xs">{item.location}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-secondary md:text-[11px]">
          <BadgeCheck className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden />
          Verified
        </span>
      </footer>
    </blockquote>
  );
}

export function TestimonialsSection({ items }: { items: Testimonial[] }) {
  return (
    <section className="bg-surface py-8 md:py-20">
      <div className="container-jj">
        <div className="mb-5 text-center md:mb-10">
          <span className="label-sm font-bold uppercase tracking-widest text-primary">
            Real Customer Love
          </span>
          <h2 className="font-display mt-1 text-xl font-semibold text-on-surface md:text-[32px]">
            <span className="md:hidden">Loved Across India</span>
            <span className="hidden md:inline">LOVED ACROSS INDIA</span>
          </h2>
        </div>

        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <div key={item.id} className="w-[85vw] max-w-80 shrink-0">
              <TestimonialCard item={item} />
            </div>
          ))}
        </div>

        <div className="hidden grid-cols-1 gap-6 md:grid md:grid-cols-3">
          {items.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
