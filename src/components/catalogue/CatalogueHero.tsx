"use client";

import Link from "next/link";
import {
  Cookie,
  Gift,
  Coffee,
  Sandwich,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";
import type { CataloguePill, CategoryId } from "@/types/catalog";

const icons = {
  menu: UtensilsCrossed,
  bakery: Wheat,
  lunch: Sandwich,
  cookie: Cookie,
  gift: Gift,
  cafe: Coffee,
} as const;

export function CatalogueHero({
  title,
  eyebrow,
  description,
  pills,
  activeCategory,
  mobileTitle,
  mobileEyebrow,
  mobileDescription,
}: {
  title: string;
  eyebrow: string;
  description: string;
  pills: CataloguePill[];
  activeCategory: CategoryId | "all";
  mobileTitle?: string;
  mobileEyebrow?: string;
  mobileDescription?: string;
}) {
  return (
    <section className="relative mb-4 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-low p-4 md:mb-8 md:p-10">
      <div className="relative z-10 max-w-3xl">
        <div className="mb-1.5 flex items-center gap-2 md:mb-2">
          <span className="veg-mark" aria-hidden>
            <span className="veg-mark-dot" />
          </span>
          <span className="label-sm uppercase tracking-widest text-secondary">
            <span className="md:hidden">{mobileEyebrow ?? eyebrow}</span>
            <span className="hidden md:inline">{eyebrow}</span>
          </span>
        </div>
        <h1 className="font-display text-xl font-bold leading-tight text-primary md:text-[32px] md:leading-10">
          <span className="md:hidden">{mobileTitle ?? title}</span>
          <span className="hidden md:inline">{title}</span>
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant md:mt-3 md:text-base md:leading-7">
          <span className="md:hidden">{mobileDescription ?? description}</span>
          <span className="hidden md:inline">{description}</span>
        </p>
      </div>

      <div className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 border-t border-outline-variant/20 pt-3 md:mt-8 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0 md:pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {pills.map((pill) => {
          const Icon = icons[pill.icon];
          const href =
            pill.id === "all" ? "/catalogue" : `/catalogue/${pill.id === "combos" ? "tea-time" : pill.id}`;
          const active =
            activeCategory === pill.id ||
            (pill.id === "combos" && activeCategory === "tea-time") ||
            (pill.id === "all" && activeCategory === "all");

          return (
            <Link
              key={pill.id}
              href={href}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition md:gap-2 md:px-4 md:py-2 ${
                active
                  ? "bg-primary text-white shadow-sm"
                  : "border border-outline-variant/50 bg-surface-container-lowest text-on-surface hover:border-primary hover:text-primary"
              }`}
            >
              <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden />
              <span className="md:hidden">
                {pill.mobileLabel ?? pill.label} ({pill.count})
              </span>
              <span className="hidden md:inline">
                {pill.label} ({pill.count})
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
