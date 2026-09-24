import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { sortOptions } from "@/data/catalogue";

export function CatalogueToolbar({
  shown,
  total,
  freshnessNote,
}: {
  shown: number;
  total: number;
  freshnessNote: string;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-outline-variant/20 py-3 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-on-surface-variant">
          <span className="md:hidden">
            <strong className="font-semibold text-on-surface">{shown}</strong>{" "}
            of {total}
          </span>
          <span className="hidden md:inline">
            Showing{" "}
            <strong className="font-semibold text-on-surface">1–{shown}</strong>{" "}
            of {total} authentic recipes
          </span>
        </p>
        <span className="hidden text-outline-variant md:inline">|</span>
        <div className="hidden items-center gap-1.5 rounded-md bg-surface-container-low px-2 py-1 md:flex">
          <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-secondary">
            {freshnessNote}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-outline">
          <span>Sort By:</span>
          <select
            className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 py-1.5 text-xs font-semibold text-on-surface focus:border-primary focus:outline-none"
            defaultValue="featured"
            aria-label="Sort products"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {/* <div className="hidden overflow-hidden rounded-lg border border-outline-variant/60 bg-surface-container-lowest sm:flex">
          <span className="bg-surface-container p-1.5 text-primary" title="Grid view">
            <LayoutGrid className="h-5 w-5" aria-hidden />
          </span>
          <span className="p-1.5 text-outline" title="List view">
            <Rows3 className="h-5 w-5" aria-hidden />
          </span>
        </div> */}
      </div>
    </div>
  );
}

export function CataloguePagination({
  shown,
  total,
}: {
  shown: number;
  total: number;
}) {
  const progress = Math.round((shown / total) * 100);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant/20 pb-4 pt-8 sm:flex-row">
      <div className="w-full sm:w-64">
        <div className="mb-1.5 flex justify-between text-[10px] font-bold uppercase tracking-wide text-outline">
          <span>
            Showing {shown} of {total} items
          </span>
          <span>{progress}% Loaded</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled
          className="flex h-9 w-9 items-center justify-center rounded border border-outline-variant/30 text-outline disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <Link
          href="/catalogue"
          className="flex h-9 w-9 items-center justify-center rounded bg-primary text-xs font-bold text-white"
          aria-current="page"
        >
          1
        </Link>
        {[2, 3, 4].map((page) => (
          <span
            key={page}
            className="flex h-9 w-9 items-center justify-center rounded border border-outline-variant/30 text-xs font-semibold text-on-surface"
          >
            {page}
          </span>
        ))}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded border border-outline-variant/30 text-on-surface"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
