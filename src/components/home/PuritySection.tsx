import { Droplets, Lock, Sparkles, Wheat } from "lucide-react";
import { purityBadges, purityPillars } from "@/data/home";

const icons = {
  droplet: Droplets,
  grain: Wheat,
  spa: Sparkles,
  lock: Lock,
} as const;

const mobileTitles: Record<string, string> = {
  ghee: "Pure Ghee",
  masale: "Stone Masale",
  cleanroom: "Shuddh Kitchen",
  seal: "Fresh Seal",
};

export function PuritySection() {
  return (
    <section
      id="purity"
      className="border-b border-outline-variant/30 bg-surface-container-low py-8 md:py-20"
    >
      <div className="container-jj">
        <div className="mx-auto mb-5 max-w-2xl text-center md:mb-10">
          <p className="label-sm uppercase tracking-[0.2em] text-primary">
            <span className="md:hidden">The Standard</span>
            <span className="hidden md:inline">✦ THE JAI JINENDRA STANDARD ✦</span>
          </p>
          <h2 className="font-display mt-2 text-xl font-semibold text-on-surface md:text-[32px]">
            <span className="md:hidden">Four Pillars of Purity</span>
            <span className="hidden md:inline">The Four Pillars of Shuddh Purity</span>
          </h2>
          <p className="mt-1.5 text-sm text-on-surface-variant md:mt-2">
            <span className="md:hidden">No palm oil. No shortcuts. Fresh daily.</span>
            <span className="hidden md:inline">
              No compromises, no palm oil, no shortcuts. Generational recipes crafted daily.
            </span>
          </p>
        </div>

        {/* Mobile: compact 2x2 */}
        <div className="grid grid-cols-2 gap-2.5 md:hidden">
          {purityPillars.map((pillar) => {
            const Icon = icons[pillar.icon];
            return (
              <article
                key={pillar.id}
                className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <h3 className="font-display text-sm font-semibold text-on-surface">
                  {mobileTitles[pillar.id] ?? pillar.title}
                </h3>
                <p className="mt-1 text-[11px] leading-snug text-on-surface-variant">
                  {pillar.detail}
                </p>
              </article>
            );
          })}
        </div>

        <div className="hidden grid-cols-1 gap-5 sm:grid-cols-2 md:grid lg:grid-cols-4">
          {purityPillars.map((pillar) => {
            const Icon = icons[pillar.icon];
            return (
              <article
                key={pillar.id}
                className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-low text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                  {pillar.subtitle}
                </p>
                <h3 className="font-display mt-1 text-xl font-semibold text-on-surface">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm text-on-surface-variant">{pillar.detail}</p>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-primary">
                  {pillar.badge}
                </p>
              </article>
            );
          })}
        </div>

        <ul className="mt-5 hidden flex-wrap items-center justify-center gap-3 md:mt-8 md:flex">
          {purityBadges.map((badge) => (
            <li
              key={badge}
              className="rounded-full border border-outline-variant/40 bg-surface-container-lowest px-4 py-2 text-xs font-semibold text-on-surface-variant"
            >
              {badge}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
