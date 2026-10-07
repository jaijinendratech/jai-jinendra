import type { ComponentType } from "react";

export type CategoryUspBadge = {
  id: string;
  label: string;
  /** Renders the brand's veg-mark instead of an icon when true. */
  veg?: boolean;
  icon?: ComponentType<{ className?: string }>;
  /** Small-caps caption inside the medallion, used by PuritySealCertification only. */
  medallionLabel?: string;
  /** One-line blurb under the heading, used by PuritySealCertification only. */
  description?: string;
};

/** Compact icon + label badge row for a single catalogue category. */
export function CategoryUspBadges({
  items,
  ariaLabel = "Category highlights",
}: {
  items: CategoryUspBadge[];
  ariaLabel?: string;
}) {
  if (!items.length) return null;

  return (
    <div
      className="mb-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:mb-8 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label={ariaLabel}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-outline-variant/20 bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-on-surface md:gap-2 md:px-4 md:py-2"
          >
            {item.veg ? (
              <span className="veg-mark" aria-hidden>
                <span className="veg-mark-dot" />
              </span>
            ) : Icon ? (
              <Icon
                className={`h-3.5 w-3.5 shrink-0 md:h-4 md:w-4 ${index % 2 === 0 ? "text-primary" : "text-secondary"}`}
                aria-hidden
              />
            ) : null}
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
