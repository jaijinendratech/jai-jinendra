"use client";

import { useState } from "react";
import { fieldClassName, labelClassName } from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { MediaUploader } from "@/components/admin/MediaUploader";

type Slide = { id: string; src: string; alt: string };

export function CarouselEditor({
  initial,
  jsonFieldName = "slidesJson",
}: {
  initial: Slide[];
  jsonFieldName?: string;
}) {
  const [slides, setSlides] = useState(initial);

  function update(index: number, patch: Partial<Slide>) {
    const next = slides.slice();
    next[index] = { ...next[index], ...patch };
    setSlides(next);
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={jsonFieldName} value={JSON.stringify(slides)} />
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
          <label className={labelClassName()}>
            ID
            <input
              value={slide.id}
              onChange={(e) => update(index, { id: e.target.value })}
              className={fieldClassName()}
            />
          </label>
          <div className="mt-2">
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
          </div>
          <label className={`${labelClassName()} mt-2`}>
            Alt text
            <input
              value={slide.alt}
              onChange={(e) => update(index, { alt: e.target.value })}
              className={fieldClassName()}
            />
          </label>
        </div>
      ))}
      <AdminIconButton
        label="Add slide"
        icon="plus"
        variant="secondary"
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
