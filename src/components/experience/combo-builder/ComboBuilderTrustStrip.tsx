import { Leaf, Plane, Sparkles, Wind } from "lucide-react";
import { comboTrustPillars } from "@/data/combo-builder";

const iconMap = {
  air: Wind,
  leaf: Leaf,
  plane: Plane,
  sparkles: Sparkles,
} as const;

export function ComboBuilderTrustStrip() {
  return (
    <section className="my-5 border-y border-outline-variant/30 bg-surface-container-high py-6 md:my-8 md:py-12">
      <div className="container-jj">
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {comboTrustPillars.map((pillar) => {
            const Icon = iconMap[pillar.icon];
            return (
              <div
                key={pillar.id}
                className="flex min-w-48 shrink-0 items-start gap-2.5 rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-on-surface">
                    {pillar.title}
                  </h3>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-on-surface-variant">
                    {pillar.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden grid-cols-1 gap-8 md:grid md:grid-cols-2 lg:grid-cols-4">
          {comboTrustPillars.map((pillar) => {
            const Icon = iconMap[pillar.icon];
            return (
              <div key={pillar.id} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface">
                    {pillar.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                    {pillar.body}
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
