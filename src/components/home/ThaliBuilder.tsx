"use client";

import Image from "next/image";
import {
  Candy,
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Flame,
  Gift,
  Lock,
  Plus,
  Search,
  ShoppingBag,
  Wheat,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@heroui/react";
import { useCart } from "@/lib/cart/use-cart";
import type { Product } from "@/types/catalog";
import {
  thaliBuilderMeta,
  thaliCategoryGroups,
  thaliPlateImage,
  thaliSlotPositions,
} from "@/data/thali-builder";

const GROUP_ICONS: Record<string, LucideIcon> = {
  candy: Candy,
  flame: Flame,
  wheat: Wheat,
  crown: Crown,
};

/** Short item subtitle for the picker rows — reuses existing product copy. */
function itemBlurb(product: Product): string {
  const text = product.tagline || product.description;
  if (!text) return "";
  return text.length > 36 ? `${text.slice(0, 36).trimEnd()}…` : text;
}

/**
 * Decorative corner ornament for the thali section — authored once as a
 * top-left flourish and mirrored into the other 3 corners via CSS scale
 * transforms on the className the caller passes in.
 */
function CornerFlourish({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M5 46C5 20 20 5 46 5" />
      <path d="M5 58C5 27 27 5 58 5" opacity="0.5" />
      <path d="M16 16L24 24M16 24L24 16" strokeWidth="1" opacity="0.7" />
      <circle cx="5" cy="46" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="46" cy="5" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="9" cy="9" r="1.75" fill="currentColor" stroke="none" opacity="0.8" />
    </svg>
  );
}

/**
 * Home page "Build Your Thali" widget. The plate is the real brass-thali
 * photo (public/images/thali-plate.png) with 4 slot buttons overlaid on its
 * bowls; items can be added either by browsing the category cards below (go
 * into the first open slot) or by clicking an empty bowl's "+" to search
 * the pool and place an item in that exact slot. Completing every slot
 * reveals the admin-configured offer %. Adding to cart uses the same
 * `updateItem` flow as the rest of the site — items go in at their normal
 * price (offer is a visual incentive, not a checkout-enforced discount,
 * matching how Combo Builder already works).
 */
export function ThaliBuilder({
  products,
  groupedIds,
  slotCount,
  discountPercent,
}: {
  products: Product[];
  /** Product ids per category card id (src/data/thali-builder.ts), from page.tsx. */
  groupedIds: Record<string, string[]>;
  slotCount: number;
  discountPercent: number;
}) {
  const router = useRouter();
  const { updateItem } = useCart();
  const [selected, setSelected] = useState<(string | null)[]>(() =>
    Array(slotCount).fill(null),
  );
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [searchSlot, setSearchSlot] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const selectedIds = useMemo(
    () => selected.filter((id): id is string => id !== null),
    [selected],
  );

  const slots = useMemo(
    () => selected.map((id) => (id ? (byId.get(id) ?? null) : null)),
    [selected, byId],
  );

  const groups = useMemo(() => {
    return thaliCategoryGroups.map((group) => {
      const items = (groupedIds[group.id] ?? []).flatMap((id) => {
        const product = byId.get(id);
        return product ? [product] : [];
      });
      const selectedCount = items.filter((p) => selectedIds.includes(p.id)).length;
      return { group, items, selectedCount };
    });
  }, [byId, groupedIds, selectedIds]);

  const isComplete = selectedIds.length === slotCount && slotCount > 0;
  const remaining = Math.max(0, slotCount - selectedIds.length);

  /** Used by category-card rows: add to (or remove from) the thali, first open slot wins. */
  function toggleFromList(productId: string) {
    setSelected((prev) => {
      const at = prev.indexOf(productId);
      if (at !== -1) {
        const next = [...prev];
        next[at] = null;
        return next;
      }
      const empty = prev.indexOf(null);
      if (empty === -1) return prev;
      const next = [...prev];
      next[empty] = productId;
      return next;
    });
  }

  /** Used by the per-slot search: place this product in this exact slot. */
  function assignToSlot(index: number, productId: string) {
    setSelected((prev) => {
      const next = prev.map((id) => (id === productId ? null : id));
      next[index] = productId;
      return next;
    });
    setSearchSlot(null);
    setSearchQuery("");
  }

  function clearSlot(index: number) {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }

  function openSearch(index: number) {
    setSearchSlot(index);
    setSearchQuery("");
  }

  const searchResults = useMemo(() => {
    if (searchSlot === null) return [];
    const q = searchQuery.trim().toLowerCase();
    const pool = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
    return pool.slice(0, 8);
  }, [products, searchSlot, searchQuery]);

  async function addThaliToCart() {
    setAdding(true);
    try {
      for (const id of selectedIds) {
        const product = byId.get(id);
        if (!product) continue;
        const variant = product.variants[0];
        const sku = variant?.sku ?? `${product.slug}-${variant?.id ?? "default"}`;
        await updateItem({ sku, qty: 1 });
      }
      toast.success("Thali added to cart", {
        description: `${selectedIds.length} items added at their regular price.`,
      });
      router.push("/cart");
    } catch (err) {
      toast.danger(
        err instanceof Error ? err.message : "Could not add thali to cart",
      );
    } finally {
      setAdding(false);
    }
  }

  if (products.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden border-b border-outline-variant/30 bg-[#f3ead5] py-8 md:py-20"
      style={{
        backgroundImage: [
          "radial-gradient(rgba(136,19,55,0.05) 1px, transparent 1px)",
          "radial-gradient(ellipse 60% 50% at 12% 15%, rgba(168,121,10,0.12), transparent 70%)",
          "radial-gradient(ellipse 55% 45% at 88% 12%, rgba(136,19,55,0.07), transparent 70%)",
          "radial-gradient(ellipse 60% 50% at 50% 95%, rgba(168,121,10,0.09), transparent 70%)",
        ].join(", "),
        backgroundSize: "18px 18px, 100% 100%, 100% 100%, 100% 100%",
      }}
    >
      <CornerFlourish className="absolute left-3 top-3 hidden h-16 w-16 text-[#b8860b]/60 sm:block md:h-20 md:w-20" />
      <CornerFlourish className="absolute right-3 top-3 hidden h-16 w-16 -scale-x-100 text-[#b8860b]/60 sm:block md:h-20 md:w-20" />
      <CornerFlourish className="absolute bottom-3 left-3 hidden h-16 w-16 -scale-y-100 text-[#b8860b]/60 sm:block md:h-20 md:w-20" />
      <CornerFlourish className="absolute bottom-3 right-3 hidden h-16 w-16 -scale-x-100 -scale-y-100 text-[#b8860b]/60 sm:block md:h-20 md:w-20" />

      <div className="container-jj">
        <div className="mx-auto mb-5 max-w-2xl text-center md:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#caa43d]/50 bg-white px-4 py-1.5 label-sm uppercase tracking-[0.2em] text-primary">
            <span className="md:hidden">{thaliBuilderMeta.mobileEyebrow}</span>
            <span className="hidden md:inline">{thaliBuilderMeta.eyebrow}</span>
          </span>
          <h2 className="font-display mt-3 text-2xl font-bold leading-tight text-primary md:text-[40px]">
            Build Your <span className="font-normal italic text-[#a8790a]">Royal Thali</span>
          </h2>
          <p className="font-display mt-2 text-sm italic text-on-surface-variant md:mt-3 md:text-base">
            Curate your handcrafted feast. Select {slotCount} delicacies to complete your thali
            and unlock a festive offer.
          </p>

          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#caa43d]/50 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <span className="h-2 w-2 rounded-full bg-[#caa43d]" aria-hidden />
            {selectedIds.length} of {slotCount} slots filled
          </span>
        </div>

        <div className="mx-auto flex max-w-5xl flex-col items-center">
          {/* The thali plate — real photo, slots overlaid on its bowls */}
          <div
            className="relative mx-auto w-full max-w-96 sm:max-w-[28rem]"
            style={{ aspectRatio: `${thaliPlateImage.width} / ${thaliPlateImage.height}` }}
          >
            <Image
              src={thaliPlateImage.src}
              alt="Brass thali platter"
              fill
              sizes="(max-width: 640px) 384px, 448px"
              className="pointer-events-none select-none object-contain"
              priority
              // Next's image optimizer re-encodes this transparent PNG as an
              // indexed/palette PNG, which some Chromium builds render with a
              // visible checkerboard instead of true transparency. Serving
              // the original (non-palette) file directly avoids that — the
              // source is already small (546×457) so there's no real
              // optimization to lose at this display size.
              unoptimized
            />

            {thaliSlotPositions.map((pos, index) => {
              const product = slots[index];
              const isEmpty = !product;
              return (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: "19%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => (isEmpty ? openSearch(index) : clearSlot(index))}
                    aria-label={
                      product
                        ? `Remove ${product.name} from thali`
                        : `Search and add an item to slot ${index + 1}`
                    }
                    className={`group relative aspect-square w-full overflow-hidden rounded-full transition ${
                      isEmpty
                        ? "hover:bg-primary/5 hover:ring-2 hover:ring-primary/30"
                        : "hover:opacity-90"
                    }`}
                  >
                    {product ? (
                      <>
                        <Image
                          src={product.image}
                          alt={product.imageAlt ?? product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                          <X className="h-4 w-4 text-white" aria-hidden />
                        </span>
                      </>
                    ) : null}
                  </button>
                  {product ? (
                    <span className="mt-1 block truncate text-center text-[9px] font-bold uppercase tracking-wide text-primary/80 md:text-[10px]">
                      {product.name}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {isComplete ? (
            <div className="mt-6 flex items-center gap-2 rounded-full bg-secondary-container/50 px-4 py-2 text-sm font-bold text-on-secondary-container">
              <Check className="h-4 w-4" aria-hidden />
              Thali complete — {discountPercent}% OFF unlocked
            </div>
          ) : (
            <div className="mt-6 flex items-center gap-2 rounded-full border border-[#caa43d]/50 bg-white px-4 py-2 text-sm font-semibold text-primary">
              <Gift className="h-4 w-4 text-[#b8860b]" aria-hidden />
              Select {remaining} more to unlock {discountPercent}% OFF
            </div>
          )}

          {/* Category picker cards — column count/width track how many cards actually
              have items, so 1-3 cards sit centered instead of left-aligned in a fixed
              4-col grid with an empty trailing column. */}
          {(() => {
            const visibleCount = groups.filter((g) => g.items.length > 0).length;
            const gridClass =
              visibleCount <= 1
                ? "max-w-xs grid-cols-1"
                : visibleCount === 2
                  ? "max-w-2xl grid-cols-1 sm:grid-cols-2"
                  : visibleCount === 3
                    ? "max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
            return (
              <div className={`mx-auto mt-6 grid w-full gap-3 ${gridClass}`}>
                {groups.map(({ group, items, selectedCount }) => {
                  if (items.length === 0) return null;
                  const Icon = GROUP_ICONS[group.icon] ?? Candy;
                  const isExpanded = expanded[group.id] ?? false;
                  const visible = isExpanded
                    ? items
                    : items.slice(0, thaliBuilderMeta.cardPreviewCount);
                  const hiddenCount = items.length - visible.length;

                  return (
                    <div
                      key={group.id}
                      className="rounded-xl border border-outline-variant/30 bg-white p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Icon className="h-3.5 w-3.5" aria-hidden />
                          </span>
                          <span className="font-display text-sm font-bold text-on-surface">
                            {group.label}
                          </span>
                        </span>
                        <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">
                          {selectedCount}/{items.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {visible.map((product) => {
                          const isSelected = selectedIds.includes(product.id);
                          const disabled = !isSelected && selectedIds.length >= slotCount;
                          return (
                            <button
                              key={product.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => toggleFromList(product.id)}
                              className={`flex w-full items-center gap-2.5 rounded-lg border p-1.5 text-left transition ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : disabled
                                    ? "cursor-not-allowed border-outline-variant/20 opacity-50"
                                    : "border-transparent hover:border-outline-variant/40 hover:bg-surface-container-lowest"
                              }`}
                            >
                              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md">
                                <Image
                                  src={product.image}
                                  alt=""
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-semibold text-on-surface">
                                  {product.name}
                                </span>
                                <span className="block truncate text-[11px] text-on-surface-variant">
                                  {itemBlurb(product)}
                                </span>
                              </span>
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                                  isSelected
                                    ? "border-primary bg-primary text-white"
                                    : "border-outline-variant/40 text-on-surface-variant"
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="h-3.5 w-3.5" aria-hidden />
                                ) : (
                                  <Plus className="h-3.5 w-3.5" aria-hidden />
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {items.length > thaliBuilderMeta.cardPreviewCount ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((prev) => ({ ...prev, [group.id]: !isExpanded }))
                          }
                          className="mt-2 flex w-full items-center justify-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          {isExpanded ? (
                            <>
                              Show less <ChevronUp className="h-3 w-3" aria-hidden />
                            </>
                          ) : (
                            <>
                              View More ({hiddenCount}) <ChevronDown className="h-3 w-3" aria-hidden />
                            </>
                          )}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })()}
          <p className="mt-3 text-center text-[11px] italic text-on-surface-variant">
            Click any delicacy to place it on your royal thali platter. Click a filled bowl on the
            platter to remove it.
          </p>

          <button
            type="button"
            disabled={!isComplete || adding}
            onClick={() => void addThaliToCart()}
            className={`mt-5 flex w-full max-w-xs items-center justify-center gap-2 rounded-full py-3 text-sm font-bold uppercase tracking-wider shadow-md transition-all sm:w-auto sm:px-10 ${
              isComplete
                ? "bg-primary text-white hover:bg-primary-container"
                : "cursor-not-allowed bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {isComplete ? (
              <ShoppingBag className="h-5 w-5" aria-hidden />
            ) : (
              <Lock className="h-4 w-4" aria-hidden />
            )}
            {adding ? "Adding…" : "Add Thali to Cart"}
          </button>
          <p className="mt-2 text-center text-xs text-on-surface-variant">
            {isComplete
              ? "All slots filled — enjoy your offer!"
              : `Fill all ${slotCount} slots to unlock the offer (${remaining} remaining).`}
          </p>
        </div>
      </div>

      {/* Per-slot search — pick an item for the bowl that was clicked */}
      {searchSlot !== null ? (
        <div
          className="fixed inset-0 z-100 flex items-start justify-center bg-black/40 p-4 pt-24"
          onClick={() => setSearchSlot(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 shrink-0 text-on-surface-variant" aria-hidden />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search delicacies for Slot ${searchSlot + 1}…`}
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchSlot(null)}
                className="rounded-full p-1 hover:bg-surface-container-high"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {searchResults.length > 0 ? (
              <ul className="mt-3 max-h-80 divide-y divide-outline-variant/20 overflow-y-auto">
                {searchResults.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        disabled={isSelected}
                        onClick={() => assignToSlot(searchSlot, product.id)}
                        className={`flex w-full items-center gap-2.5 py-2.5 text-left transition ${
                          isSelected ? "cursor-not-allowed opacity-50" : "hover:text-primary"
                        }`}
                      >
                        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={product.image}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {product.name}
                          </span>
                          <span className="block truncate text-xs text-on-surface-variant">
                            {itemBlurb(product)}
                          </span>
                        </span>
                        {isSelected ? (
                          <Check className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                        ) : (
                          <Plus className="h-4 w-4 shrink-0 text-on-surface-variant" aria-hidden />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-on-surface-variant">No delicacies found.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
