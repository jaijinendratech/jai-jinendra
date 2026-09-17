"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ShieldCheck, SlidersHorizontal } from "lucide-react";
import type {
  CatalogueFilterOption,
  PriceRangeOption,
} from "@/types/catalog";

function buildFilterHref(
  pathname: string,
  searchParams: URLSearchParams,
  key: string,
  value: string | null,
) {
  const params = new URLSearchParams(searchParams.toString());
  if (value) params.set(key, value);
  else params.delete(key);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function CatalogueFilters({
  specialty,
  purity,
  spice,
  prices,
  activeCategory,
  warranty,
}: {
  specialty: CatalogueFilterOption[];
  purity: CatalogueFilterOption[];
  spice: CatalogueFilterOption[];
  prices: PriceRangeOption[];
  activeCategory: string;
  warranty: { title: string; body: string };
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activePurity = searchParams.get("purity");
  const activeSpice = searchParams.get("spice");
  const activePrice = searchParams.get("price");

  return (
    <aside className="sticky top-28 hidden space-y-6 rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm lg:col-span-3 lg:block">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold text-on-surface">Refine Flavors</h2>
        </div>
        <Link href={pathname} className="text-xs font-semibold text-primary hover:underline">
          Clear All
        </Link>
      </div>

      <div className="space-y-3 border-b border-outline-variant/20 pb-4">
        <h3 className="text-sm font-bold text-on-surface">Specialty Category</h3>
        <ul className="space-y-2 text-sm">
          {specialty.map((item) => {
            const checked = activeCategory === item.id;
            return (
              <li key={item.id}>
                <Link
                  href={`/catalogue/${item.id}`}
                  className={`flex items-center justify-between transition hover:text-primary ${
                    checked ? "font-semibold text-primary" : "text-on-surface"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
                        checked
                          ? "border-primary bg-primary text-[10px] text-white"
                          : "border-outline-variant"
                      }`}
                      aria-hidden
                    >
                      {checked ? "✓" : null}
                    </span>
                    {item.label}
                  </span>
                  {item.count != null ? (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-outline">
                      {item.count}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-3 border-b border-outline-variant/20 pb-4">
        <h3 className="text-sm font-bold text-on-surface">Purity & Preparation</h3>
        <ul className="space-y-2 text-xs">
          {purity.map((item) => {
            const checked = activePurity === item.id;
            return (
              <li key={item.id}>
                <Link
                  href={buildFilterHref(
                    pathname,
                    searchParams,
                    "purity",
                    checked ? null : item.id,
                  )}
                  className={`flex items-center gap-2.5 transition hover:text-primary ${
                    checked ? "font-semibold text-primary" : "text-on-surface"
                  }`}
                >
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
                      checked
                        ? "border-primary bg-primary text-[10px] text-white"
                        : "border-outline-variant"
                    }`}
                    aria-hidden
                  >
                    {checked ? "✓" : null}
                  </span>
                  {item.id === "pure-veg" ? (
                    <span className="veg-mark" aria-hidden>
                      <span className="veg-mark-dot" />
                    </span>
                  ) : null}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-3 border-b border-outline-variant/20 pb-4">
        <h3 className="text-sm font-bold text-on-surface">Spice Notes</h3>
        <div className="grid grid-cols-2 gap-2">
          {spice.map((item) => {
            const checked = activeSpice === item.id;
            return (
              <Link
                key={item.id}
                href={buildFilterHref(
                  pathname,
                  searchParams,
                  "spice",
                  checked ? null : item.id,
                )}
                className={`rounded border px-2.5 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide transition hover:border-primary ${
                  checked
                    ? "border-primary bg-surface-container text-primary"
                    : "border-outline-variant/60 text-on-surface-variant"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 border-b border-outline-variant/20 pb-4">
        <h3 className="text-sm font-bold text-on-surface">Price Range</h3>
        <div className="flex flex-wrap gap-2">
          {prices.map((item) => {
            const checked = activePrice === item.id;
            return (
              <Link
                key={item.id}
                href={buildFilterHref(
                  pathname,
                  searchParams,
                  "price",
                  checked ? null : item.id,
                )}
                className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition ${
                  checked
                    ? "bg-primary text-white"
                    : "border border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-outline-variant/40 bg-surface-container-low p-4">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-secondary" aria-hidden />
        <div>
          <h4 className="text-xs font-bold text-on-surface">{warranty.title}</h4>
          <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">{warranty.body}</p>
        </div>
      </div>
    </aside>
  );
}
