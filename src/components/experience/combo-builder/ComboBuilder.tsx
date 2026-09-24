"use client";

import Image from "next/image";
import {
  ArrowRight,
  Check,
  Loader2,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { productCategorySlug } from "@/lib/catalog/aliases";
import type { Product } from "@/types/catalog";
import { useCart } from "@/lib/cart/use-cart";
import {
  comboBoxSizes,
  comboBuilderDefaultQty,
  comboBuilderMeta,
  comboFilters,
  comboItemShortNames,
  comboItemTags,
  type ComboBoxSize,
  type ComboFilterId,
} from "@/data/combo-builder";
import { formatINR } from "@/lib/format";
import { SafeHtml } from "@/components/shared/SafeHtml";

type QtyMap = Record<string, number>;

function filterProducts(
  products: Product[],
  filterId: ComboFilterId,
  query: string,
) {
  const filter = comboFilters.find((item) => item.id === filterId);
  const normalizedQuery = query.trim().toLowerCase();

  return products.filter((product) => {
    const matchesFilter =
      !filter ||
      filter.categories === "all" ||
      (Array.isArray(filter.categories) &&
        filter.categories.includes(productCategorySlug(product) as never));

    const matchesQuery =
      !normalizedQuery ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery);

    return matchesFilter && matchesQuery;
  });
}

function getFilledSlots(qty: QtyMap) {
  return Object.values(qty).reduce((sum, count) => sum + count, 0);
}

export function ComboBuilder({ products }: { products: Product[] }) {
  const router = useRouter();
  const { updateItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [selectedBox, setSelectedBox] = useState<ComboBoxSize>(
    comboBoxSizes[0],
  );
  const [qty, setQty] = useState<QtyMap>(() => ({ ...comboBuilderDefaultQty }));
  const [activeFilter, setActiveFilter] = useState<ComboFilterId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const listKey = `${activeFilter}|${searchQuery}|${products.length}`;
  const [visibleState, setVisibleState] = useState({
    key: listKey,
    count: 12,
  });
  const visibleCount =
    visibleState.key === listKey ? visibleState.count : 12;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(
    () => filterProducts(products, activeFilter, searchQuery),
    [products, activeFilter, searchQuery],
  );

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || visibleCount >= filteredProducts.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleState((prev) => {
          const current = prev.key === listKey ? prev.count : 12;
          return {
            key: listKey,
            count: Math.min(current + 12, filteredProducts.length),
          };
        });
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleCount, filteredProducts.length, listKey]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const selectedItems = useMemo(
    () =>
      products
        .map((product) => ({ product, count: qty[product.id] ?? 0 }))
        .filter((row) => row.count > 0),
    [products, qty],
  );

  const slotEntries = useMemo(() => {
    const entries: Product[] = [];
    for (const { product, count } of selectedItems) {
      for (let i = 0; i < count; i += 1) {
        entries.push(product);
      }
    }
    return entries;
  }, [selectedItems]);
  const filledSlots = useMemo(() => getFilledSlots(qty), [qty]);
  const itemsSubtotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, row) => sum + row.product.price * row.count,
        0,
      ),
    [selectedItems],
  );
  const discount =
    selectedItems.length >= 2
      ? Math.round(
          (itemsSubtotal + selectedBox.basePrice) *
            comboBuilderMeta.comboDiscountRate,
        )
      : 0;
  const estimatedTotal = selectedBox.basePrice + itemsSubtotal - discount;
  const originalTotal = selectedBox.basePrice + itemsSubtotal;

  function setCount(id: string, next: number) {
    setQty((prev) => {
      const current = prev[id] ?? 0;
      const otherSlots = getFilledSlots(prev) - current;
      const maxForItem = selectedBox.slots - otherSlots;
      const value = Math.max(0, Math.min(maxForItem, next));

      if (value === 0) {
        const rest = { ...prev };
        delete rest[id];
        return rest;
      }
      return { ...prev, [id]: value };
    });
  }

  function handleBoxChange(box: ComboBoxSize) {
    setSelectedBox(box);
    setQty((prev) => {
      const next: QtyMap = {};
      let remaining = box.slots;
      for (const [id, count] of Object.entries(prev)) {
        if (remaining <= 0) break;
        const assigned = Math.min(count, remaining);
        if (assigned > 0) next[id] = assigned;
        remaining -= assigned;
      }
      return next;
    });
  }

  return (
    <main className="container-jj py-8 md:py-10">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left column */}
        <div className="space-y-8 lg:col-span-8">
          {/* Box size selection */}
          <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="label-sm font-bold uppercase tracking-wider text-primary">
                  Base Presentation
                </span>
                <h2 className="font-display text-xl font-semibold text-on-surface">
                  Selected Box Architecture
                </h2>
              </div>
              <span className="text-xs text-on-surface-variant">
                Change box capacity anytime
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {comboBoxSizes.map((box) => {
                const isSelected = selectedBox.id === box.id;
                return (
                  <button
                    key={box.id}
                    type="button"
                    onClick={() => handleBoxChange(box)}
                    className={`relative rounded-lg p-4 text-left transition-all ${
                      isSelected
                        ? "border-2 border-primary bg-primary-fixed/20"
                        : "border border-outline-variant/40 bg-surface-container-lowest hover:border-primary/50"
                    }`}
                  >
                    {isSelected ? (
                      <Check
                        className="absolute right-2 top-2 h-5 w-5 text-primary"
                        aria-hidden
                      />
                    ) : null}
                    <p
                      className={`font-display text-lg font-bold ${isSelected ? "text-primary" : "text-on-surface"}`}
                    >
                      {box.name}
                    </p>
                    <SafeHtml
                      html={box.description}
                      as="p"
                      className="mt-1 text-xs text-on-surface-variant"
                    />
                    <div className="mt-3 flex items-center justify-between border-t border-outline-variant/30 pt-3">
                      <span
                        className={`text-[10px] font-bold ${isSelected ? "text-on-surface" : "text-on-surface-variant"}`}
                      >
                        {box.capacityLabel}
                      </span>
                      <span
                        className={`price text-sm font-bold ${isSelected ? "text-primary" : "text-on-surface"}`}
                      >
                        {formatINR(box.basePrice)} base
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Filters */}
          <section className="flex flex-col gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {comboFilters.map((filter) => {
                const count =
                  filter.id === "all"
                    ? products.length
                    : products.filter(
                        (product) =>
                          Array.isArray(filter.categories) &&
                          filter.categories.includes(
                            productCategorySlug(product) as never,
                          ),
                      ).length;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={`rounded px-4 py-2 text-xs font-semibold transition-all ${
                      activeFilter === filter.id
                        ? "bg-primary text-on-primary"
                        : "border border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {filter.label} ({count})
                  </button>
                );
              })}
            </div>
            <div className="relative min-w-50">
              <Search
                className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant"
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search delicacies..."
                className="w-full rounded border border-outline-variant/50 bg-surface-container-lowest py-1.5 pl-9 pr-3 text-sm text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </section>

          {/* Product grid — progressive reveal */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {visibleProducts.map((product, index) => {
              const count = qty[product.id] ?? 0;
              const inBox = count > 0;
              const canAdd = filledSlots < selectedBox.slots;
              const tag =
                comboItemTags[product.id] ?? product.tagline ?? product.badge;

              return (
                <article
                  key={product.id}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-xl shadow-sm transition-all ${
                    inBox
                      ? "border-2 border-primary bg-surface-container-lowest"
                      : "border border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50"
                  }`}
                >
                  {inBox ? (
                    <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-primary shadow-sm">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                      In Box ({count})
                    </div>
                  ) : null}

                  <div className="relative aspect-4/3 overflow-hidden bg-surface-container-high">
                    <Image
                      src={product.image}
                      alt={product.imageAlt ?? product.name}
                      fill
                      priority={index < 4}
                      loading={index < 4 ? "eager" : "lazy"}
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 left-2">
                      <span className="veg-mark" aria-hidden>
                        <span className="veg-mark-dot" />
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      {tag ? (
                        <span className="mb-1 inline-block rounded bg-surface-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          {tag}
                        </span>
                      ) : null}
                      <h3 className="font-display text-lg font-semibold text-on-surface transition-colors group-hover:text-primary">
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-outline-variant/30 pt-3">
                      <div>
                        <span className="price text-sm font-bold text-primary">
                          {formatINR(product.price)}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {" "}
                          / {product.variants[0]?.label ?? "pack"}
                        </span>
                      </div>

                      {inBox ? (
                        <div className="flex items-center gap-2 rounded border border-outline-variant/30 bg-surface-container p-1">
                          <button
                            type="button"
                            aria-label={`Decrease ${product.name}`}
                            onClick={() => setCount(product.id, count - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded bg-surface text-primary transition hover:bg-primary hover:text-on-primary"
                          >
                            <Minus className="h-4 w-4" aria-hidden />
                          </button>
                          <span className="numeric min-w-4 px-1 text-center text-sm font-bold">
                            {count}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase ${product.name}`}
                            disabled={!canAdd}
                            onClick={() => setCount(product.id, count + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded bg-surface text-primary transition hover:bg-primary hover:text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!canAdd}
                          onClick={() => setCount(product.id, 1)}
                          className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" aria-hidden />
                          Add to Box
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {visibleCount < filteredProducts.length ? (
            <div
              ref={loadMoreRef}
              className="mt-6 flex flex-col items-center gap-2"
            >
              <Loader2
                className="h-5 w-5 animate-spin text-primary"
                aria-label="Loading more products"
              />
              <p className="text-xs text-on-surface-variant">
                Showing {visibleCount} of {filteredProducts.length}
              </p>
            </div>
          ) : null}
        </div>

        {/* Right sticky sidebar */}
        <aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-36">
          <div className="rounded-xl border-2 border-primary-container/40 bg-surface-container-lowest p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div>
                <span className="label-sm font-bold uppercase tracking-wider text-primary">
                  Live Hamper Config
                </span>
                <h3 className="font-display text-xl font-semibold text-on-surface">
                  Your Custom Box
                </h3>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {filledSlots} of {selectedBox.slots} Slots Filled
              </div>
            </div>

            <div className="py-4">
              <p className="label-sm mb-2 uppercase tracking-wider text-on-surface-variant">
                Box Layout Preview ({selectedBox.slots} Compartments)
              </p>
              <div
                className={`grid gap-2 rounded-lg border border-outline-variant/40 bg-surface-container-low p-2 ${
                  selectedBox.slots <= 4
                    ? "grid-cols-4"
                    : selectedBox.slots <= 6
                      ? "grid-cols-3"
                      : "grid-cols-4"
                }`}
              >
                {Array.from({ length: selectedBox.slots }).map((_, index) => {
                  const product = slotEntries[index];
                  const isEmpty = !product;

                  return (
                    <div
                      key={index}
                      className={`flex aspect-square flex-col items-center justify-center rounded border p-1 text-center ${
                        isEmpty
                          ? "animate-pulse border-2 border-dashed border-primary/40 bg-primary-fixed/10"
                          : "border-primary/40 bg-surface shadow-xs"
                      }`}
                    >
                      {isEmpty ? (
                        <>
                          <Plus className="h-4 w-4 text-primary" aria-hidden />
                          <span className="text-[9px] font-semibold text-primary">
                            Pick More
                          </span>
                        </>
                      ) : (
                        <>
                          <UtensilsCrossed
                            className="h-4 w-4 text-primary"
                            aria-hidden
                          />
                          <span className="w-full truncate text-[9px] font-bold text-primary">
                            {comboItemShortNames[product.id] ?? product.name}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="combo-scroll max-h-52 space-y-3 overflow-y-auto border-y border-outline-variant/30 py-2">
              {selectedItems.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  Add treats to preview your box.
                </p>
              ) : (
                selectedItems.map(({ product, count }) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="h-2 w-2 shrink-0 rounded-full bg-secondary" />
                      <div className="min-w-0">
                        <span className="block truncate font-semibold text-on-surface">
                          {count > 1 ? `${count}× ` : ""}
                          {product.name}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {product.variants[0]?.label ?? "Standard pack"}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="price font-bold text-on-surface">
                        {formatINR(product.price * count)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${product.name}`}
                        onClick={() => setCount(product.id, 0)}
                        className="text-outline transition hover:text-error"
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-1.5 py-3 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>{selectedBox.name}</span>
                <span className="price font-medium text-on-surface">
                  {formatINR(selectedBox.basePrice)}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Nitrogen seal &amp; gift-ready pack</span>
                <span className="font-medium text-secondary">Included</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Items Total ({selectedItems.length} selected)</span>
                <span className="price font-medium text-on-surface">
                  {formatINR(itemsSubtotal)}
                </span>
              </div>
              {discount > 0 ? (
                <div className="flex justify-between font-medium text-secondary">
                  <span>Combo Builder Discount (15%)</span>
                  <span className="price">-{formatINR(discount)}</span>
                </div>
              ) : null}
            </div>

            <div className="space-y-3 border-t border-outline-variant/40 pt-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="label-sm block uppercase tracking-wider text-on-surface-variant">
                    Estimated Total
                  </span>
                  <span className="text-xs text-secondary">Taxes included</span>
                </div>
                <div className="text-right">
                  {discount > 0 ? (
                    <span className="price mr-2 text-sm text-on-surface-variant line-through">
                      {formatINR(originalTotal)}
                    </span>
                  ) : null}
                  <span className="price text-2xl font-bold text-primary">
                    {formatINR(estimatedTotal)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={filledSlots === 0 || adding}
                onClick={async () => {
                  setAdding(true);
                  try {
                    for (const { product, count } of selectedItems) {
                      const variant = product.variants[0];
                      const sku =
                        variant?.sku ??
                        `${product.slug}-${variant?.id ?? "default"}`;
                      await updateItem({ sku, qty: count });
                    }
                    router.push("/cart");
                  } finally {
                    setAdding(false);
                  }
                }}
                className={`flex w-full items-center justify-center gap-2 rounded py-3.5 text-sm font-bold shadow-md transition-all ${
                  filledSlots === 0
                    ? "pointer-events-none bg-surface-container-high text-on-surface-variant"
                    : "bg-primary text-on-primary hover:bg-primary-container"
                }`}
              >
                <ShoppingBag className="h-5 w-5" aria-hidden />
                {adding ? "Adding…" : "Complete Box & Add to Cart"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>

              <p className="text-center text-[10px] text-on-surface-variant">
                {filledSlots < comboBuilderMeta.freeShippingSlotThreshold
                  ? `Pick ${comboBuilderMeta.freeShippingSlotThreshold - filledSlots} more item${comboBuilderMeta.freeShippingSlotThreshold - filledSlots === 1 ? "" : "s"} to unlock free express shipping upgrade!`
                  : "Free express shipping upgrade unlocked!"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
            <div className="shrink-0 rounded border border-outline-variant/20 bg-surface p-2 text-primary">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">
                The Jai Jinendra Purity Promise
              </h4>
              <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">
                Batch-fried fresh each morning. Sealed with medical-grade food
                nitrogen so every bite crackles as if straight from the kadai.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
