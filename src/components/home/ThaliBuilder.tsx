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
  Sparkles,
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
import { thaliBuilderMeta, thaliCategoryGroups } from "@/data/thali-builder";

/** Approximate centers (viewBox 0-100) of a 3-col × 2-row slot grid. */
const SLOT_POSITIONS = [
  { x: 21, y: 27 },
  { x: 50, y: 27 },
  { x: 79, y: 27 },
  { x: 21, y: 73 },
  { x: 50, y: 73 },
  { x: 79, y: 73 },
];

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
 * Home page "Build Your Thali" widget — click pool items (grouped into
 * Sweets / Namkeens / Bakery / Gajak cards) to fill thali slots in order;
 * completing every slot reveals the admin-configured offer %. Adding to
 * cart uses the same `updateItem` flow as the rest of the site — items go
 * in at their normal price (offer is a visual incentive, not a
 * checkout-enforced discount, matching how Combo Builder already works).
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const slots = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return Array.from({ length: slotCount }, (_, i) => {
      const id = selectedIds[i];
      return id ? (byId.get(id) ?? null) : null;
    });
  }, [products, selectedIds, slotCount]);

  const groups = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return thaliCategoryGroups.map((group) => {
      const items = (groupedIds[group.id] ?? []).flatMap((id) => {
        const product = byId.get(id);
        return product ? [product] : [];
      });
      const selectedCount = items.filter((p) => selectedIds.includes(p.id)).length;
      return { group, items, selectedCount };
    });
  }, [products, groupedIds, selectedIds]);

  const isComplete = selectedIds.length === slotCount && slotCount > 0;
  const remaining = Math.max(0, slotCount - selectedIds.length);

  function toggle(productId: string) {
    setSelectedIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= slotCount) return prev;
      return [...prev, productId];
    });
  }

  async function addThaliToCart() {
    setAdding(true);
    try {
      for (const id of selectedIds) {
        const product = products.find((p) => p.id === id);
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
      className="border-b border-outline-variant/30 bg-[#fdf8f2] py-8 md:py-20"
      style={{
        backgroundImage:
          "radial-gradient(rgba(136,19,55,0.06) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    >
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
          {/* The thali plate */}
          <div
            className="relative aspect-square w-full max-w-80 shrink-0 rounded-full p-[6px] shadow-[0_14px_30px_-6px_rgba(136,19,55,0.25)] sm:max-w-96 md:p-2"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #caa43d 0%, #f3dfa0 28%, #b8860b 58%, #8a6508 100%)",
            }}
          >
            <div
              className="relative h-full w-full rounded-full p-6 md:p-8"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 50% 42%, #fffdf8 0%, #fbf0dc 70%, #f3e2bb 100%)",
              }}
            >
              {/* Decorative center emblem + guide lines (non-interactive) */}
              <div className="pointer-events-none absolute inset-6 md:inset-8" aria-hidden>
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 h-full w-full text-primary/15"
                >
                  {SLOT_POSITIONS.map((pos, i) => (
                    <line
                      key={i}
                      x1={50}
                      y1={50}
                      x2={pos.x}
                      y2={pos.y}
                      stroke="currentColor"
                      strokeWidth={0.5}
                      strokeDasharray="2 2"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                  <Sparkles className="h-3 w-3 text-[#caa43d]" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary/70 md:text-[10px]">
                    {thaliBuilderMeta.centerLabel}
                  </span>
                  <Sparkles className="h-3 w-3 text-[#caa43d]" />
                </div>
              </div>

              <div className="relative grid h-full grid-cols-3 gap-2.5 md:gap-3">
                {slots.map((product, index) => {
                  const isEmpty = !product;
                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={isEmpty}
                      aria-label={
                        product
                          ? `Remove ${product.name} from thali`
                          : `Empty thali slot ${index + 1}`
                      }
                      onClick={() => product && toggle(product.id)}
                      className={`relative flex aspect-square flex-col items-center justify-center gap-0.5 overflow-hidden rounded-full border-2 transition ${
                        isEmpty
                          ? "cursor-default border-dashed border-primary/30 bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,#f1e6d2_100%)] shadow-[inset_0_2px_6px_rgba(136,19,55,0.08)]"
                          : "border-[#caa43d] bg-surface shadow-xs hover:opacity-90"
                      }`}
                    >
                      {product ? (
                        <>
                          <Image
                            src={product.image}
                            alt={product.imageAlt ?? product.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition hover:bg-black/40 hover:opacity-100">
                            <X className="h-4 w-4 text-white" aria-hidden />
                          </span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 text-primary/50 md:h-5 md:w-5" aria-hidden />
                          <span className="text-[8px] font-bold uppercase tracking-wider text-primary/40 md:text-[9px]">
                            Slot {index + 1}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
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

          {/* Category picker cards */}
          <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                      const selected = selectedIds.includes(product.id);
                      const disabled = !selected && selectedIds.length >= slotCount;
                      return (
                        <button
                          key={product.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => toggle(product.id)}
                          className={`flex w-full items-center gap-2.5 rounded-lg border p-1.5 text-left transition ${
                            selected
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
                              selected
                                ? "border-primary bg-primary text-white"
                                : "border-outline-variant/40 text-on-surface-variant"
                            }`}
                          >
                            {selected ? (
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
    </section>
  );
}
