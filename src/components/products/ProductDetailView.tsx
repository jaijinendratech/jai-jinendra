"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { ProductCard } from "@/components/products/ProductCard";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SafeHtml } from "@/components/shared/SafeHtml";
import { useCart } from "@/lib/cart/use-cart";
import type { Product } from "@/types/catalog";
import { formatINR } from "@/lib/format";

function AccordionBlock({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-outline-variant/25">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-bold text-on-surface">{title}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-on-surface-variant transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? <div className="pb-4">{children}</div> : null}
    </div>
  );
}

export function ProductDetailView({
  product,
  related,
  categoryLabel,
  categoryHref,
}: {
  product: Product;
  related: Product[];
  categoryLabel: string;
  categoryHref: string;
}) {
  const router = useRouter();
  const { updateItem } = useCart();
  const [activeVariant, setActiveVariant] = useState(product.variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [cartError, setCartError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const activeVariantData = useMemo(
    () => product.variants.find((v) => v.id === activeVariant),
    [activeVariant, product.variants],
  );

  const unitPrice = useMemo(() => {
    return (
      product.variants.find((variant) => variant.id === activeVariant)?.price ??
      product.price
    );
  }, [activeVariant, product]);

  const shortDescription = product.description;
  const longCopy = product.longDescription ?? product.description;
  const keyBullets = [
    ...(product.ingredients?.slice(0, 3) ?? []),
    product.shelfLife,
    product.origin ? `Origin: ${product.origin}` : null,
  ].filter(Boolean) as string[];

  async function addToCart(redirectToCheckout = false) {
    if (!activeVariant) return;
    setAdding(true);
    setCartError(null);
    try {
      const sku =
        activeVariantData?.sku ?? `${product.slug}-${activeVariant}`;
      await updateItem({ sku, qty: quantity });
      if (redirectToCheckout) router.push("/checkout");
      else router.push("/cart");
    } catch (err) {
      setCartError(err instanceof Error ? err.message : "Could not add to cart");
    } finally {
      setAdding(false);
    }
  }

  const purchaseDisabled = adding || activeVariantData?.stockQty === 0;

  return (
    <main className="container-jj pb-24 pt-4 md:py-10 md:pb-10">
      <div className="hidden md:block">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Catalogue", href: "/catalogue" },
            { label: categoryLabel, href: categoryHref },
            { label: product.name },
          ]}
        />
      </div>
      <div className="mb-3 md:hidden">
        <Link
          href={categoryHref}
          className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
        >
          ← {categoryLabel}
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low lg:sticky lg:top-28">
            <div className="relative aspect-square w-full">
              {product.badge ? (
                <span className="absolute left-3 top-3 z-10 rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white md:left-4 md:top-4 md:px-2.5 md:py-1">
                  {product.badge}
                </span>
              ) : null}
              <Image
                src={product.image}
                alt={product.imageAlt}
                fill
                priority
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="veg-mark" aria-hidden>
              <span className="veg-mark-dot" />
            </span>
            <span className="label-sm uppercase tracking-widest text-secondary">
              {product.tagline ?? "100% Shuddh Pure Veg"}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-sm font-bold text-tertiary-container">
              <Star className="h-4 w-4 fill-amber-rating text-amber-rating" aria-hidden />
              {product.rating.toFixed(1)}
              <span className="font-normal text-on-surface-variant">
                <span className="md:hidden">
                  ({product.reviewCount.toLocaleString("en-IN")})
                </span>
                <span className="hidden md:inline">
                  ({product.reviewCount.toLocaleString("en-IN")} reviews)
                </span>
              </span>
            </span>
          </div>

          <h1 className="font-display mt-2 text-2xl font-semibold text-on-surface md:mt-3 md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-baseline gap-2 md:mt-5 md:gap-3">
            <p className="price text-2xl font-bold text-on-surface md:text-3xl">
              {formatINR(unitPrice)}
            </p>
            {product.originalPrice ? (
              <>
                <p className="price text-sm text-outline line-through">
                  {formatINR(product.originalPrice)}
                </p>
                {product.discountLabel ? (
                  <span className="rounded bg-secondary-container/50 px-2 py-0.5 text-xs font-bold text-on-secondary-container">
                    {product.discountLabel}
                  </span>
                ) : null}
              </>
            ) : null}
          </div>

          {/* Mobile: short description + bullets */}
          <div className="mt-3 md:hidden">
            <SafeHtml
              html={shortDescription}
              className="text-sm leading-6 text-on-surface-variant"
            />
            {keyBullets.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-on-surface-variant">
                {keyBullets.map((bullet) => (
                  <li key={bullet}>• {bullet}</li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Desktop: full long description */}
          <SafeHtml
            html={longCopy}
            className="mt-3 hidden max-w-xl text-sm leading-6 text-on-surface-variant md:mt-3 md:block md:text-base md:leading-7"
          />

          {product.variants.length > 0 ? (
            <div className="mt-5 md:mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface">
                Pack Size
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setActiveVariant(variant.id)}
                    className={`rounded border px-3 py-2 text-xs font-bold ${
                      activeVariant === variant.id
                        ? "border-primary-container bg-primary-container text-white"
                        : "border-outline-variant/40 bg-white text-on-surface-variant hover:border-primary"
                    }`}
                  >
                    {variant.label}
                    {variant.stockQty === 0 ? (
                      <span className="ml-2 text-[10px] uppercase text-error">OOS</span>
                    ) : null}
                    {variant.price ? (
                      <span className="price ml-2 hidden font-semibold opacity-80 sm:inline">
                        {formatINR(variant.price)}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {cartError ? (
            <p className="mt-4 rounded-lg border border-error/30 bg-error-container/40 px-3 py-2 text-sm text-error">
              {cartError}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-6">
            <div className="inline-flex h-11 items-stretch overflow-hidden rounded border border-outline-variant/40 bg-white md:h-12">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="flex w-11 items-center justify-center text-on-surface hover:bg-surface-container-low"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="numeric flex min-w-12 items-center justify-center border-x border-outline-variant/40 text-sm font-bold">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="flex w-11 items-center justify-center text-on-surface hover:bg-surface-container-low"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Desktop purchase buttons */}
            <Button
              type="button"
              isDisabled={purchaseDisabled}
              onClick={() => void addToCart(false)}
              className="hidden h-12 min-h-12 flex-1 rounded bg-primary-container px-6 text-sm font-semibold text-white hover:bg-primary sm:flex-none sm:min-w-48 md:inline-flex"
            >
              {adding ? "Adding…" : "Add to Cart"} —{" "}
              <span className="price">{formatINR(unitPrice * quantity)}</span>
            </Button>
            <Button
              type="button"
              isDisabled={purchaseDisabled}
              onClick={() => void addToCart(true)}
              className="hidden h-12 min-h-12 rounded border border-primary bg-transparent px-5 text-sm font-semibold text-primary hover:bg-primary/5 md:inline-flex"
            >
              Buy Now
            </Button>
          </div>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2 md:mt-6 md:gap-3">
            <div className="flex items-start gap-3 rounded-lg border border-outline-variant/20 p-3">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-xs font-bold text-on-surface">Pan-India Express</p>
                <p className="text-xs text-on-surface-variant">
                  Dispatched in 24 hrs • Free above ₹999
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-outline-variant/20 p-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden />
              <div>
                <p className="text-xs font-bold text-on-surface">
                  {product.shelfLife ?? "Nitrogen sealed freshness"}
                </p>
                <p className="text-xs text-on-surface-variant">
                  Origin: {product.origin ?? "Rajasthan"}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile: details as accordions; desktop: open cards */}
          <div className="mt-6 md:hidden">
            {longCopy !== shortDescription ? (
              <AccordionBlock title="Full Description">
                <SafeHtml
                  html={longCopy}
                  className="text-sm leading-6 text-on-surface-variant"
                />
              </AccordionBlock>
            ) : null}
            {product.dietary?.length ? (
              <AccordionBlock title="Dietary Hallmarks">
                <ul className="space-y-1.5 text-xs text-on-surface-variant">
                  {product.dietary.map((item) => (
                    <li key={item} className="capitalize">
                      • {item.replace(/-/g, " ")}
                    </li>
                  ))}
                </ul>
              </AccordionBlock>
            ) : null}
            {product.ingredients?.length ? (
              <AccordionBlock title="Key Ingredients">
                <ul className="space-y-1.5 text-xs text-on-surface-variant">
                  {product.ingredients.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </AccordionBlock>
            ) : null}
          </div>

          {(product.dietary?.length || product.ingredients?.length) && (
            <div className="mt-8 hidden gap-4 sm:grid-cols-2 md:grid">
              {product.dietary?.length ? (
                <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                  <h2 className="text-sm font-bold text-on-surface">Dietary Hallmarks</h2>
                  <ul className="mt-2 space-y-1.5 text-xs text-on-surface-variant">
                    {product.dietary.map((item) => (
                      <li key={item} className="capitalize">
                        • {item.replace(/-/g, " ")}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {product.ingredients?.length ? (
                <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                  <h2 className="text-sm font-bold text-on-surface">Key Ingredients</h2>
                  <ul className="mt-2 space-y-1.5 text-xs text-on-surface-variant">
                    {product.ingredients.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-10 border-t border-outline-variant/20 pt-8 md:mt-16 md:pt-10">
          <div className="mb-4 flex items-end justify-between gap-4 md:mb-6">
            <div>
              <p className="label-sm uppercase tracking-widest text-primary">You May Also Love</p>
              <h2 className="font-display mt-1 text-xl font-semibold text-on-surface md:text-2xl">
                <span className="md:hidden">Related picks</span>
                <span className="hidden md:inline">Related from this collection</span>
              </h2>
            </div>
            <Link
              href={categoryHref}
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              <span className="md:hidden">View all</span>
              <span className="hidden md:inline">View collection</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Sticky mobile purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/30 bg-surface/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <div className="min-w-0 shrink-0 pr-1">
            <p className="price text-base font-bold leading-none text-on-surface">
              {formatINR(unitPrice * quantity)}
            </p>
            <p className="mt-0.5 text-[10px] text-on-surface-variant">
              {quantity > 1 ? `${quantity} × ${formatINR(unitPrice)}` : "Incl. pack size"}
            </p>
          </div>
          <Button
            type="button"
            isDisabled={purchaseDisabled}
            onClick={() => void addToCart(false)}
            className="h-11 min-h-11 flex-1 rounded-lg bg-primary-container text-sm font-semibold text-white hover:bg-primary"
          >
            {adding ? "Adding…" : "Add to Cart"}
          </Button>
          <Button
            type="button"
            isDisabled={purchaseDisabled}
            onClick={() => void addToCart(true)}
            className="h-11 min-h-11 rounded-lg border border-primary bg-transparent px-3 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            Buy
          </Button>
        </div>
      </div>
    </main>
  );
}
