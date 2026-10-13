import { Sparkles } from "lucide-react";
import type { CategoryUspBadge } from "@/components/catalogue/CategoryUspBadges";

/**
 * Bakery-only USP strip: a header bar plus 4 circular "medallion" seal cards.
 * Visual redesign only, the seals are not clickable filters (see plan notes
 * in the session this was built from); purely a trust/quality display.
 */
export function PuritySealCertification({ items }: { items: CategoryUspBadge[] }) {
  if (!items.length) return null;

  return (
    <section
      className="mb-4 overflow-hidden rounded-2xl p-3 md:mb-10 md:p-6"
    >
      <div className="-mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 [scrollbar-width:none] md:-mx-6 md:gap-4 md:px-6 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex w-[calc((100%-1rem)/2.5)] shrink-0 snap-start flex-col items-center rounded-xl border border-outline-variant/20 bg-white px-2 py-3 text-center md:w-[calc((100%-2rem)/2.5)] md:px-4 md:py-5 lg:w-auto lg:flex-1 lg:basis-0"
            >
              <div
                className="relative flex h-14 w-14 shrink-0 md:h-24 md:w-24 items-center justify-center rounded-full border-4"
                style={{
                  borderColor: "#caa43d",
                  backgroundImage:
                    "radial-gradient(circle at 50% 35%, #fffdf7 0%, #f6ecd4 100%)",
                }}
              >
                <Sparkles
                  className="absolute right-0.5 top-0.5 h-3.5 w-3.5 text-[#caa43d]"
                  aria-hidden
                />
                <div className="flex flex-col items-center gap-1">
                  {item.veg ? (
                    <span className="veg-mark" aria-hidden>
                      <span className="veg-mark-dot" />
                    </span>
                  ) : Icon ? (
                    <Icon className="h-5 w-5 text-[#8a6508]" aria-hidden />
                  ) : null}
                  {item.medallionLabel ? (
                    <span className="hidden px-1 text-center text-[8px] font-bold uppercase leading-tight tracking-wider text-[#8a6508] md:block">
                      {item.medallionLabel}
                    </span>
                  ) : null}
                </div>
              </div>

              <h3 className="font-display mt-2 text-xs font-bold leading-tight text-primary md:mt-4 md:text-lg">
                {item.label}
              </h3>
              {item.description ? (
                <p className="mt-1.5 hidden text-xs leading-5 text-on-surface-variant md:block">
                  {item.description}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
