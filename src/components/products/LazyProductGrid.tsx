"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types/catalog";

const DEFAULT_INITIAL = 8;
const DEFAULT_PAGE = 8;

export function LazyProductGrid({
  products,
  className = "grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3",
  initialCount = DEFAULT_INITIAL,
  pageSize = DEFAULT_PAGE,
  /** First N cards get priority images (above the fold). */
  priorityCount = 4,
  /** Optional slot rendered after `midAfter` visible products (e.g. gift banner). */
  midSlot,
  midAfter = 6,
}: {
  products: Product[];
  className?: string;
  initialCount?: number;
  pageSize?: number;
  priorityCount?: number;
  midSlot?: ReactNode;
  midAfter?: number;
}) {
  const listKey = products.map((p) => p.id).join("|");
  const [visibleState, setVisibleState] = useState({
    key: listKey,
    count: Math.min(initialCount, products.length),
  });
  const visibleCount =
    visibleState.key === listKey
      ? visibleState.count
      : Math.min(initialCount, products.length);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || visibleCount >= products.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleState((prev) => {
          const current =
            prev.key === listKey
              ? prev.count
              : Math.min(initialCount, products.length);
          return {
            key: listKey,
            count: Math.min(current + pageSize, products.length),
          };
        });
      },
      { rootMargin: "240px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleCount, products.length, pageSize, listKey, initialCount]);

  if (products.length === 0) return null;

  const visible = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;
  const showMid =
    Boolean(midSlot) && visibleCount >= Math.min(midAfter, products.length);
  const beforeMid = showMid
    ? visible.slice(0, Math.min(midAfter, visible.length))
    : visible;
  const afterMid = showMid ? visible.slice(midAfter) : [];

  return (
    <div className="space-y-8">
      <div className={className}>
        {beforeMid.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            href={`/products/${product.slug}`}
            priority={index < priorityCount}
          />
        ))}
      </div>

      {showMid ? midSlot : null}

      {afterMid.length > 0 ? (
        <div className={className}>
          {afterMid.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              href={`/products/${product.slug}`}
            />
          ))}
        </div>
      ) : null}

      {hasMore ? (
        <div
          ref={sentinelRef}
          className="flex flex-col items-center gap-2 py-2"
          aria-hidden={false}
        >
          <Loader2
            className="h-5 w-5 animate-spin text-primary"
            aria-label="Loading more products"
          />
          <p className="text-xs text-on-surface-variant">
            Showing {visibleCount} of {products.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
