"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

export type GalleryImage = string | { src: string; alt?: string };

/**
 * Main image + thumbnail strip for any number of images.
 * Falls back to the legacy single `image` when `images` is missing or empty.
 * Thumbnails are hidden when there is only one image.
 */
export function ProductGallery({
  images,
  image,
  alt,
  badge,
}: {
  images?: GalleryImage[];
  /** Legacy single image, used only when `images` is empty. */
  image?: string;
  /** Fallback alt text (usually the product name). */
  alt: string;
  badge?: string;
}) {
  const normalized = (images ?? [])
    .map((img) => (typeof img === "string" ? { src: img } : img))
    .filter((img) => Boolean(img.src));
  const gallery =
    normalized.length > 0 ? normalized : image ? [{ src: image }] : [];

  const [active, setActive] = useState(0);
  const activeIndex = Math.min(active, Math.max(gallery.length - 1, 0));
  const current = gallery[activeIndex];

  return (
    <div className="min-w-0 lg:sticky lg:top-28">
      <div className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low">
        <div className="relative aspect-square w-full">
          {badge ? (
            <span className="absolute left-3 top-3 z-10 rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white md:left-4 md:top-4 md:px-2.5 md:py-1">
              {badge}
            </span>
          ) : null}
          {current ? (
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt || alt}
              fill
              priority={activeIndex === 0}
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover motion-safe:animate-gallery-fade"
            />
          ) : null}
        </div>
      </div>

      {gallery.length > 1 ? (
        <div
          className="mt-3 flex gap-2.5 overflow-x-auto pb-1"
          role="group"
          aria-label="Product images"
        >
          {gallery.map((img, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={`${img.src}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${gallery.length}`}
                aria-current={selected ? "true" : undefined}
                className={cn(
                  "relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-surface-container-low transition-colors sm:w-20",
                  selected
                    ? "border-primary"
                    : "border-outline-variant/30 hover:border-primary/40",
                )}
              >
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
