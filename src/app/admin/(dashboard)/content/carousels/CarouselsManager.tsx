"use client";

import { useState } from "react";
import { saveCarouselSlidesAction } from "@/lib/admin/actions";
import type { CarouselPageKey } from "@/lib/admin/queries";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { CarouselEditor } from "./CarouselEditor";

type Slide = { id: string; src: string; alt: string };

const TABS: { key: CarouselPageKey; label: string }[] = [
  { key: "home", label: "Home page carousel" },
  { key: "sweets", label: "Sweets page carousel" },
  { key: "kachoris", label: "Kachori page carousel" },
  { key: "hampers", label: "Hamper page carousel" },
  { key: "combos", label: "Combo pack carousel" },
];

export function CarouselsManager({
  slidesByPage,
}: {
  slidesByPage: Record<CarouselPageKey, Slide[]>;
}) {
  const [active, setActive] = useState<CarouselPageKey>("home");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-outline-variant/25 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              active === tab.key
                ? "bg-primary text-white"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {TABS.map((tab) =>
        tab.key === active ? (
          <form
            key={tab.key}
            action={saveCarouselSlidesAction}
            className="space-y-4 rounded-xl border border-outline-variant/25 bg-white p-6 shadow-sm"
          >
            <input type="hidden" name="pageKey" value={tab.key} />
            <p className="text-sm text-on-surface-variant">
              Stored as <code className="text-xs">content_blocks</code> ·{" "}
              <code className="text-xs">
                {tab.key} / hero_slides
              </code>
            </p>
            <CarouselEditor
              key={tab.key}
              initial={slidesByPage[tab.key]}
            />
            <AdminIconButton
              type="submit"
              label={`Save ${tab.label.toLowerCase()}`}
              icon="save"
              variant="primary"
              showLabel
            />
          </form>
        ) : null,
      )}
    </div>
  );
}
