"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import {
  attributeFilterGroups,
  spiceFilterOptions,
} from "@/lib/catalog/filters";
import type {
  CatalogueFilterOption,
  PriceRangeOption,
  Product,
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
  products,
  prices,
  activeSlug,
}: {
  specialty: (CatalogueFilterOption & { href: string; group?: string | null })[];
  products: Product[];
  prices: PriceRangeOption[];
  activeSlug: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeCount = ["attr", "spice", "price"].filter((key) =>
    searchParams.get(key),
  ).length;

  const panel = (
    <FilterPanel
      specialty={specialty}
      products={products}
      prices={prices}
      activeSlug={activeSlug}
    />
  );

  return (
    <>
      <aside className="sticky top-28 hidden space-y-6 rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm lg:col-span-3 lg:block">
        {panel}
      </aside>

      {/* Mobile: filter button + bottom sheet (desktop sidebar is hidden below lg) */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-primary-container bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filters
          {activeCount > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </button>

        {mobileOpen ? (
          <div
            className="fixed inset-0 z-100 flex items-end bg-black/40"
            onClick={() => setMobileOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              className="max-h-[85vh] w-full overflow-y-auto overscroll-contain rounded-t-2xl bg-surface-container-lowest p-5 shadow-xl"
              onClick={(event) => {
                event.stopPropagation();
                // Filter options are links; close the sheet once one is chosen.
                if ((event.target as HTMLElement).closest("a")) {
                  setMobileOpen(false);
                }
              }}
            >
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-1.5 hover:bg-surface-container-high"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="space-y-6">{panel}</div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

function FilterPanel({
  specialty: allSpecialty,
  products,
  prices,
  activeSlug,
}: {
  specialty: (CatalogueFilterOption & { href: string; group?: string | null })[];
  products: Product[];
  prices: PriceRangeOption[];
  activeSlug: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSub = searchParams.get("sub");
  const activeAttr = searchParams.get("attr");
  const activeSpice = searchParams.get("spice");
  const activePrice = searchParams.get("price");
  const attributeGroups = attributeFilterGroups(products);
  const spice = spiceFilterOptions(products);
  // Only list the open category's own sections (e.g. Namkeen page must not
  // show Bakery filters). Pages with no single category (festive, all) keep
  // the full list.
  const scoped = allSpecialty.filter(
    (item) => item.id === activeSlug || item.id.startsWith(`${activeSlug}/`),
  );
  const specialty = scoped.length > 0 ? scoped : allSpecialty;

  return (
    <>
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold text-on-surface">
            Refine Flavors
          </h2>
        </div>
        <Link
          href={pathname}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Clear All
        </Link>
      </div>

      {specialty.length > 0 ? (
      <div className="space-y-3 border-b border-outline-variant/20 pb-4">
        <h3 className="text-sm font-bold text-on-surface">
          Specialty Category
        </h3>
        <ul className="space-y-2 text-sm">
          {specialty.map((item, index) => {
            const checked = item.id.includes("/")
              ? item.id === `${activeSlug}/${activeSub}`
              : activeSlug === item.id && !activeSub;
            const showGroup =
              item.group && item.group !== specialty[index - 1]?.group;
            return (
              <li key={item.id}>
                {showGroup ? (
                  <p className="mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-widest text-outline first:mt-0">
                    {item.group}
                  </p>
                ) : null}
                <Link
                  href={item.href}
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
      ) : null}

      {attributeGroups.map((group) => (
        <div
          key={group.title}
          className="space-y-3 border-b border-outline-variant/20 pb-4"
        >
          <h3 className="text-sm font-bold text-on-surface">{group.title}</h3>
          <ul className="space-y-2 text-xs">
            {group.options.map((item) => {
              const checked = activeAttr === item.id;
              return (
                <li key={item.id}>
                  <Link
                    href={buildFilterHref(
                      pathname,
                      searchParams,
                      "attr",
                      checked ? null : item.id,
                    )}
                    className={`flex items-center justify-between gap-2 transition hover:text-primary ${
                      checked ? "font-semibold text-primary" : "text-on-surface"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2.5">
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
                      <span className="font-medium">{item.label}</span>
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
      ))}

      {spice.length > 0 ? (
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
      ) : null}

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
    </>
  );
}
