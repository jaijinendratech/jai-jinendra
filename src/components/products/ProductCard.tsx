"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button, toast } from "@heroui/react";
import type { Product } from "@/types/catalog";
import { formatINR } from "@/lib/format";
import { useWishlist } from "@/lib/wishlist/use-wishlist";
import { useCart } from "@/lib/cart/use-cart";

export function ProductCard({
  product,
  href,
  priority = false,
}: {
  product: Product;
  href?: string;
  /** Eager-load image for above-the-fold cards. */
  priority?: boolean;
}) {
  const [activeVariant, setActiveVariant] = useState(product.variants[0]?.id);
  const [adding, setAdding] = useState(false);
  const productHref = href ?? `/products/${product.slug}`;
  const activeVariantData = product.variants.find((v) => v.id === activeVariant);
  const activePrice = activeVariantData?.price ?? product.price;
  const { has, toggle, hydrated } = useWishlist();
  const { updateItem } = useCart();
  const favourited = hydrated && has(product.id);

  function onToggleFavourite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nowOn = toggle(product.id);
    if (nowOn) toast.success("Added to favourites", { description: product.name });
    else toast("Removed from favourites", { description: product.name });
  }

  async function onAddToCart() {
    const variant = activeVariantData ?? product.variants[0];
    if (!variant) {
      toast.danger("No variant available");
      return;
    }
    setAdding(true);
    try {
      const sku = variant.sku ?? `${product.slug}-${variant.id}`;
      await updateItem({ sku, qty: 1 });
      toast.success("Added to cart", { description: product.name });
    } catch (err) {
      toast.danger(
        err instanceof Error ? err.message : "Could not add to cart",
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="culinary-lift flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-surface-container-low">
        {product.badge ? (
          <span className="absolute left-2 top-2 z-10 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white sm:left-2.5 sm:top-2.5 sm:px-2 sm:text-[10px]">
            {product.badge}
          </span>
        ) : null}
        <Link href={productHref} className="absolute inset-0 block">
          <Image
            src={product.image}
            alt={product.imageAlt ?? product.name}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            sizes="(max-width:640px) 50vw, (max-width:1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-300 hover:scale-105"
          />
          <span className="sr-only">View {product.name}</span>
        </Link>
        <button
          type="button"
          aria-label={
            favourited
              ? `Remove ${product.name} from favourites`
              : `Add ${product.name} to favourites`
          }
          aria-pressed={favourited}
          onClick={onToggleFavourite}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-on-surface-variant shadow-sm transition hover:text-primary sm:right-2.5 sm:top-2.5"
        >
          <Heart
            className={`h-4 w-4 ${favourited ? "fill-primary text-primary" : ""}`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-3.5">
        <div className="flex items-center gap-1.5">
          <span className="veg-mark shrink-0 scale-90 sm:scale-100" aria-hidden>
            <span className="veg-mark-dot" />
          </span>
          <span className="truncate text-[9px] font-bold uppercase tracking-wider text-secondary sm:text-[10px]">
            {product.tagline ?? "Pure Veg"}
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="font-display line-clamp-2 text-sm font-semibold leading-snug text-on-surface sm:text-base md:truncate md:text-lg">
            <Link href={productHref} className="transition hover:text-primary">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 hidden line-clamp-2 text-xs leading-snug text-on-surface-variant md:block">
            {product.description}
          </p>
        </div>

        {product.variants.length > 0 ? (
          <div className="hidden flex-wrap items-center gap-1.5 md:flex">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setActiveVariant(variant.id)}
                className={`rounded border px-2 py-0.5 text-[10px] font-bold leading-tight ${
                  activeVariant === variant.id
                    ? "border-primary-container bg-primary-container text-white"
                    : "border-outline-variant/40 bg-white text-on-surface-variant hover:border-primary"
                }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-1.5 border-t border-outline-variant/20 pt-2 sm:gap-2 sm:pt-3">
          <div className="min-w-0">
            <p className="price text-sm font-bold leading-none text-on-surface sm:text-lg">
              {formatINR(activePrice)}
            </p>
            {product.originalPrice ? (
              <p className="mt-0.5 hidden text-xs text-on-surface-variant sm:mt-1 md:block">
                <span className="price line-through">{formatINR(product.originalPrice)}</span>
                {product.discountLabel ? (
                  <span className="ml-1.5 font-semibold text-secondary">
                    {product.discountLabel}
                  </span>
                ) : null}
              </p>
            ) : product.ctaNote ? (
              <p className="mt-0.5 hidden text-xs text-on-surface-variant md:block">
                {product.ctaNote}
              </p>
            ) : null}
          </div>

          <Button
            isDisabled={adding || !product.variants.length}
            onPress={() => void onAddToCart()}
            className="h-8 min-h-8 shrink-0 rounded-lg bg-primary-container px-2.5 text-xs font-semibold text-white hover:bg-primary sm:h-9 sm:min-h-9 sm:px-3 sm:text-sm"
          >
            {adding ? (
              <Loader2
                className="h-4 w-4 animate-spin"
                aria-label="Adding to cart"
              />
            ) : (
              "Add"
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
