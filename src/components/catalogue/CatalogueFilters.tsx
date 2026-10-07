"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSub = searchParams.get("sub");
  const activeAttr = searchParams.get("attr");
  const activeSpice = searchParams.get("spice");
  const activePrice = searchParams.get("price");
  const attributeGroups = attributeFilterGroups(products);
  const spice = spiceFilterOptions(products);

  return (
    <aside className="sticky top-28 hidden space-y-6 rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm lg:col-span-3 lg:block">
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
    </aside>
  );
}
