import { DropletOff, Flame, Leaf, MoonStar, Package, Truck } from "lucide-react";
import type { TrustItem } from "@/types/catalog";

const iconMap = {
  eco: Leaf,
  package: Package,
  shipping: Truck,
  palm: DropletOff,
  falahaar: MoonStar,
  fresh: Flame,
  swiggy: Leaf,
  zomato: Leaf,
  loved: Leaf,
} as const;

function SwiggyMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-label="Swiggy"
      role="img"
    >
      <rect width="24" height="24" rx="6" fill="#FC8019" />
      <path
        fill="#fff"
        d="M12.2 5.2c-2.9 0-5.3 2.1-5.3 5.4 0 2.4 1.5 4 3.5 4 .6 0 1.1-.1 1.6-.4l.3 1.6c-.6.3-1.3.5-2.1.5-3.3 0-5.6-2.4-5.6-5.8C4.6 6.8 7.8 4 12.1 4c4.2 0 7.3 2.6 7.3 6.3 0 3.7-2.8 6.3-6.6 6.3-.9 0-1.7-.2-2.4-.5l.6-2.1c.5.2 1.1.4 1.8.4 2.4 0 4.2-1.7 4.2-4.1 0-2.4-1.8-4.1-4.8-4.1Zm-.2 3.3c.9 0 1.5.6 1.5 1.4 0 .9-.6 1.5-1.5 1.5s-1.5-.6-1.5-1.5c0-.8.6-1.4 1.5-1.4Z"
      />
    </svg>
  );
}

function ZomatoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-label="Zomato"
      role="img"
    >
      <rect width="24" height="24" rx="6" fill="#E23744" />
      <path
        fill="#fff"
        d="M6.4 8.2h11.2v1.6H13.6c.9.7 1.5 1.8 1.6 3.1H17.6v1.6h-2.3c-.3 2.1-2 3.7-4.2 3.7H6.4v-1.6h4.7c1.3 0 2.3-.9 2.5-2.1H6.4v-1.6h7.3c-.3-1.2-1.4-2.1-2.7-2.1H6.4V8.2Z"
      />
    </svg>
  );
}

function BrandLogos({ logos }: { logos: NonNullable<TrustItem["brandLogos"]> }) {
  return (
    <span className="ml-1 inline-flex items-center gap-1">
      {logos.includes("swiggy") ? (
        <SwiggyMark className="h-5 w-5 shrink-0 md:h-6 md:w-6" />
      ) : null}
      {logos.includes("zomato") ? (
        <ZomatoMark className="h-5 w-5 shrink-0 md:h-6 md:w-6" />
      ) : null}
    </span>
  );
}

function iconChipClass(icon: TrustItem["icon"]) {
  if (icon === "veg") return "border-secondary/20 bg-surface-container-low text-secondary";
  if (icon === "loved") return "border-transparent bg-surface-container-low text-primary";
  return "border-outline-variant/30 bg-surface-container-low text-primary";
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
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const Icon = item.icon === "veg" || item.brandLogos?.length ? null : iconMap[item.icon];
            return (
              <div
                key={item.id}
                className="flex min-w-38 shrink-0 items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 shadow-sm"
              >
                {item.brandLogos?.length ? (
                  <BrandLogos logos={item.brandLogos} />
                ) : (
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
                )}
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

        <div className="hidden grid-cols-2 gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3.5 shadow-sm sm:grid md:grid-cols-4 md:divide-x md:divide-outline-variant/30 md:rounded-full md:gap-0 md:px-6">
          {items.map((item) => {
            const Icon = item.icon === "veg" || item.brandLogos?.length ? null : iconMap[item.icon];
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-2 py-1.5 md:px-4 md:py-0"
              >
                {item.brandLogos?.length ? (
                  <BrandLogos logos={item.brandLogos} />
                ) : (
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
                )}
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
