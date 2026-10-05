"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { BrandSpinner } from "@/components/shared/BrandSpinner";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatINR } from "@/lib/format";
import type { SearchProductHit } from "@/lib/catalog/cached";

export function SearchDialog({ products }: { products: SearchProductHit[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Search catalog"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
      >
        <Search className="h-5 w-5" />
      </button>

      {open ? <SearchPanel products={products} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function SearchPanel({
  products,
  onClose,
}: {
  products: SearchProductHit[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const searching = query.trim().length > 0 && query !== debouncedQuery;

  const catalog = useMemo(
    () =>
      products.map((product) => ({
        product,
        name: product.name.toLowerCase(),
        description: product.description.toLowerCase(),
      })),
    [products],
  );

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return { q: "", hits: [] as SearchProductHit[] };
    const hits = catalog
      .filter((item) => item.name.includes(q) || item.description.includes(q))
      .slice(0, 8)
      .map((item) => item.product);
    return { q, hits };
  }, [catalog, debouncedQuery]);

  const deferred = useDeferredValue(filtered);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center bg-black/40 p-4 pt-24"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search catalog"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 shrink-0 text-on-surface-variant" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search namkeens, mithai, hampers…"
            className="flex-1 bg-transparent text-sm outline-none"
            aria-busy={searching}
          />
          {searching ? <BrandSpinner size={16} label="Searching" /> : null}
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-surface-container-high"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {deferred.hits.length > 0 ? (
          <ul className="mt-3 max-h-80 divide-y divide-outline-variant/20 overflow-y-auto">
            {deferred.hits.map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between py-3 text-sm hover:text-primary"
                >
                  <span>{product.name}</span>
                  <span className="price font-semibold">{formatINR(product.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : deferred.q ? (
          <p className="mt-3 text-sm text-on-surface-variant">No products found.</p>
        ) : null}
      </div>
    </div>
  );
}
