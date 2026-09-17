import { Droplets, Leaf, PackageCheck, Truck } from "lucide-react";
import { catalogueMeta } from "@/data/catalogue";

const icons = [Droplets, Leaf, PackageCheck, Truck] as const;

export function CatalogueQualityStrip() {
  return (
    <section className="mt-6 border-t border-outline-variant/20 pt-6 md:mt-10 md:pt-10">
      {/* Mobile horizontal scroll */}
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {catalogueMeta.qualityPillars.map((pillar, index) => {
          const Icon = icons[index] ?? Leaf;
          return (
            <div
              key={pillar.id}
              className="flex min-w-44 shrink-0 items-start gap-2.5 rounded-lg border border-outline-variant/20 bg-surface-container-low p-3"
            >
              <Icon
                className={`mt-0.5 h-5 w-5 shrink-0 ${index % 2 === 0 ? "text-primary" : "text-secondary"}`}
                aria-hidden
              />
              <div>
                <h3 className="text-xs font-bold text-on-surface">
                  {pillar.title}
                </h3>
                <p className="mt-0.5 text-[11px] leading-4 text-on-surface-variant">
                  {pillar.mobileBody}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden grid-cols-1 gap-4 sm:grid-cols-2 md:grid lg:grid-cols-4">
        {catalogueMeta.qualityPillars.map((pillar, index) => {
          const Icon = icons[index] ?? Leaf;
          return (
            <div
              key={pillar.id}
              className="flex items-start gap-3.5 rounded-lg border border-outline-variant/20 bg-surface-container-low p-4"
            >
              <Icon
                className={`mt-0.5 h-8 w-8 shrink-0 ${index % 2 === 0 ? "text-primary" : "text-secondary"}`}
                aria-hidden
              />
              <div>
                <h3 className="text-sm font-bold text-on-surface">
                  {pillar.title}
                </h3>
                <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">
                  {pillar.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
