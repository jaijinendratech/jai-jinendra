"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Product } from "@/types/catalog";
import { formatINR } from "@/lib/format";

export function SearchDialog({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [products, query]);

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

      {open ? (
        <div className="fixed inset-0 z-100 flex items-start justify-center bg-black/40 p-4 pt-24">
          <div className="w-full max-w-lg rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-on-surface-variant" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search namkeens, mithai, hampers…"
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 hover:bg-surface-container-high"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {results.length > 0 ? (
              <ul className="mt-3 max-h-80 overflow-y-auto divide-y divide-outline-variant/20">
                {results.map((product) => (
                  <li key={product.slug}>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between py-3 text-sm hover:text-primary"
                    >
                      <span>{product.name}</span>
                      <span className="price font-semibold">
                        {formatINR(product.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : query.trim() ? (
              <p className="mt-3 text-sm text-on-surface-variant">
                No products found.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
