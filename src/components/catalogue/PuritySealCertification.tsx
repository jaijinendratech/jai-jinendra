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
      className="mb-4 overflow-hidden rounded-2xl border border-[#caa43d]/30 p-3 md:mb-10 md:p-6"
      style={{
        backgroundImage: "linear-gradient(135deg, #fdf8f0 0%, #f3e7cc 100%)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-[#caa43d]/25 pb-3 md:gap-3 md:pb-4">
        <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#caa43d]/50 bg-white text-[#b8860b] md:flex">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-base font-bold text-primary md:text-xl">
              Purity Seal Certification
            </h2>
            <span className="rounded-full border border-[#caa43d]/50 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#b8860b]">
              Gourmet Standard
            </span>
          </div>
          <p className="mt-0.5 hidden text-xs text-on-surface-variant md:block md:text-sm">
            Every seal marks a quality promise we keep in our kitchen.
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:mt-5 md:gap-4 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex flex-col items-center rounded-xl border border-outline-variant/20 bg-white px-2 py-3 text-center md:px-4 md:py-5"
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
