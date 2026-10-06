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
      className="mb-6 overflow-hidden rounded-2xl border border-[#caa43d]/30 p-5 md:mb-10 md:p-6"
      style={{
        backgroundImage: "linear-gradient(135deg, #fdf8f0 0%, #f3e7cc 100%)",
      }}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-[#caa43d]/25 pb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#caa43d]/50 bg-white text-[#b8860b]">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-bold text-primary md:text-xl">
              Purity Seal Certification
            </h2>
            <span className="rounded-full border border-[#caa43d]/50 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#b8860b]">
              Gourmet Standard
            </span>
          </div>
          <p className="mt-0.5 text-xs text-on-surface-variant md:text-sm">
            Every seal marks a quality promise we keep in our kitchen.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex flex-col items-center rounded-xl border border-outline-variant/20 bg-white px-4 py-5 text-center"
            >
              <div
                className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4"
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
                    <span className="px-1 text-center text-[8px] font-bold uppercase leading-tight tracking-wider text-[#8a6508]">
                      {item.medallionLabel}
                    </span>
                  ) : null}
                </div>
              </div>

              <h3 className="font-display mt-4 text-base font-bold text-primary md:text-lg">
                {item.label}
              </h3>
              {item.description ? (
                <p className="mt-1.5 text-xs leading-5 text-on-surface-variant">
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
