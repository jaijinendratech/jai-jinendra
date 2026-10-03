import { Leaf, Package, Truck, UtensilsCrossed } from "lucide-react";
import type { TrustItem } from "@/types/catalog";

const iconMap = {
  eco: Leaf,
  package: Package,
  shipping: Truck,
  swiggy: UtensilsCrossed,
  zomato: UtensilsCrossed,
} as const;

/** Swiggy/Zomato get their own brand-colored chip instead of the shared neutral circle. */
const brandChipClass: Partial<Record<TrustItem["icon"], string>> = {
  swiggy: "border-transparent bg-[#FC8019] text-white",
  zomato: "border-transparent bg-[#E23744] text-white",
};

function iconChipClass(icon: TrustItem["icon"]) {
  if (icon === "veg") return "border-secondary/20 bg-surface-container-low text-secondary";
  return (
    brandChipClass[icon] ??
    "border-outline-variant/30 bg-surface-container-low text-primary"
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="ml-1.5 inline-flex shrink-0 items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold leading-none text-primary md:px-2 md:text-[10px]">
      {text}
    </span>
  );
}

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
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${iconChipClass(item.icon)}`}
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
                  <h3 className="flex items-center truncate text-[11px] font-semibold leading-tight text-on-surface">
                    <span className="truncate">{item.mobileTitle ?? item.title}</span>
                    {item.badge ? <Badge text={item.badge} /> : null}
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
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${iconChipClass(item.icon)}`}
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
                  <h3 className="flex items-center text-[13px] font-semibold leading-tight text-on-surface">
                    {item.title}
                    {item.badge ? <Badge text={item.badge} /> : null}
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
