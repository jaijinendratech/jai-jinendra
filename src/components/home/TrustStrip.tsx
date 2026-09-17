import { Leaf, Package, Truck } from "lucide-react";
import type { TrustItem } from "@/types/catalog";

const iconMap = {
  eco: Leaf,
  package: Package,
  shipping: Truck,
} as const;

export function TrustStrip({ items }: { items: TrustItem[] }) {
  return (
    <section className="border-b border-outline-variant/30 bg-surface py-4 md:py-8">
      <div className="container-jj">
        {/* Mobile: horizontal scroller */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const Icon = item.icon === "veg" ? null : iconMap[item.icon];
            return (
              <div
                key={item.id}
                className="flex min-w-38 shrink-0 items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 shadow-sm"
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-surface-container-low ${
                    item.icon === "veg"
                      ? "border-secondary/20 text-secondary"
                      : "border-outline-variant/30 text-primary"
                  }`}
                >
                  {item.icon === "veg" ? (
                    <span className="veg-mark scale-90" aria-hidden>
                      <span className="veg-mark-dot" />
                    </span>
                  ) : (
                    Icon && <Icon className="h-3.5 w-3.5" aria-hidden />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[11px] font-semibold leading-tight text-on-surface">
                    {item.mobileTitle ?? item.title}
                  </h3>
                  <p className="mt-0.5 truncate text-[10px] leading-tight text-on-surface-variant">
                    {item.mobileDescription ?? item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop / tablet: full strip */}
        <div className="hidden grid-cols-2 gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3.5 shadow-sm sm:grid md:grid-cols-4 md:divide-x md:divide-outline-variant/30 md:rounded-full md:gap-0 md:px-6">
          {items.map((item) => {
            const Icon = item.icon === "veg" ? null : iconMap[item.icon];
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-2 py-1.5 md:px-4 md:py-0"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-surface-container-low ${
                    item.icon === "veg"
                      ? "border-secondary/20 text-secondary"
                      : "border-outline-variant/30 text-primary"
                  }`}
                >
                  {item.icon === "veg" ? (
                    <span className="veg-mark scale-110" aria-hidden>
                      <span className="veg-mark-dot" />
                    </span>
                  ) : (
                    Icon && <Icon className="h-5 w-5" aria-hidden />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[13px] font-semibold leading-tight text-on-surface">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] leading-tight text-on-surface-variant">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
