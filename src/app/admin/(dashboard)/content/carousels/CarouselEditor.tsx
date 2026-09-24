"use client";

import { useState } from "react";
import {
  AdminFieldFull,
  AdminFieldGrid,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { PageHeroCarousel } from "@/components/shared/PageHeroCarousel";

type Slide = { id: string; src: string; alt: string };

export function CarouselEditor({
  initial,
  jsonFieldName = "slidesJson",
  previewLabel = "Carousel preview",
}: {
  initial: Slide[];
  jsonFieldName?: string;
  previewLabel?: string;
}) {
  const [slides, setSlides] = useState(initial);

  function update(index: number, patch: Partial<Slide>) {
    const next = slides.slice();
    next[index] = { ...next[index], ...patch };
    setSlides(next);
  }

  const previewSlides = slides.filter((s) => Boolean(s.src));

  return (
    <div className="space-y-4">
      <input type="hidden" name={jsonFieldName} value={JSON.stringify(slides)} />

      <div className="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-low">
        <p className="border-b border-outline-variant/20 px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary">
          Live preview
        </p>
        {previewSlides.length ? (
          <div className="pointer-events-none select-none [&_section]:py-2 md:[&_section]:py-3">
            <PageHeroCarousel
              slides={previewSlides}
              label={previewLabel}
              showNavButtons={false}
              compactMobile
            />
          </div>
        ) : (
          <p className="px-4 py-10 text-center text-sm text-on-surface-variant">
            Add a slide image to see the carousel preview.
          </p>
        )}
      </div>

      {slides.map((slide, index) => (
        <div
          key={`${slide.id}-${index}`}
          className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Slide {index + 1}
            </p>
            <AdminIconButton
              label="Remove slide"
              icon="trash"
              variant="danger"
              onClick={() => setSlides(slides.filter((_, i) => i !== index))}
            />
          </div>
          <AdminFieldGrid>
            <label className={labelClassName()}>
              ID
              <input
                value={slide.id}
                onChange={(e) => update(index, { id: e.target.value })}
                className={fieldClassName()}
              />
            </label>
            <label className={labelClassName()}>
              Alt text
              <input
                value={slide.alt}
                onChange={(e) => update(index, { alt: e.target.value })}
                className={fieldClassName()}
              />
            </label>
            <AdminFieldFull>
              <MediaUploader
                key={slide.src}
                name={`slide-src-${index}`}
                folder="carousels"
                label="Slide image"
                defaultItems={slide.src ? [{ path: slide.src, url: slide.src }] : []}
                onChange={(items) => {
                  const next = items[0]?.url || items[0]?.path || "";
                  if (next) update(index, { src: next });
                }}
              />
            </AdminFieldFull>
          </AdminFieldGrid>
        </div>
      ))}
      <AdminIconButton
        label="Add slide"
        icon="plus"
        variant="secondary"
        showLabel
        onClick={() =>
          setSlides([
            ...slides,
            {
              id: `slide-${Date.now().toString(36)}`,
              src: "",
              alt: "New slide",
            },
          ])
        }
      />
    </div>
  );
}
