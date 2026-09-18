"use client";

import { useState } from "react";
import Link from "next/link";
import { saveHomepageContentAction } from "@/lib/admin/actions";
import {
  AdminCard,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";

type Slide = { id: string; src: string; alt: string };

export function HomepageContentEditor({
  announcement: initialAnnouncement,
  celebrationTitle: initialTitle,
  celebrationBody: initialBody,
  slides,
}: {
  announcement: string;
  celebrationTitle: string;
  celebrationBody: string;
  slides: Slide[];
}) {
  const [announcement, setAnnouncement] = useState(initialAnnouncement);
  const [celebrationTitle, setCelebrationTitle] = useState(initialTitle);
  const [celebrationBody, setCelebrationBody] = useState(initialBody);
  const previewSlide = slides[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
      <form action={saveHomepageContentAction} className="space-y-5">
        <AdminCard title="Announcement">
          <label className={labelClassName()}>
            Announcement bar
            <textarea
              name="announcement"
              rows={2}
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className={fieldClassName()}
            />
          </label>
        </AdminCard>

        <AdminCard title="Celebration banner">
          <label className={labelClassName()}>
            Title
            <input
              name="celebrationTitle"
              value={celebrationTitle}
              onChange={(e) => setCelebrationTitle(e.target.value)}
              className={fieldClassName()}
            />
          </label>
          <label className={`${labelClassName()} mt-3`}>
            Body
            <textarea
              name="celebrationBody"
              rows={3}
              value={celebrationBody}
              onChange={(e) => setCelebrationBody(e.target.value)}
              className={fieldClassName()}
            />
          </label>
        </AdminCard>

        <AdminCard title="Hero slides">
          <p className="text-sm text-on-surface-variant">
            Home hero slides are edited under{" "}
            <Link
              href="/admin/content/carousels"
              className="font-semibold text-primary hover:underline"
            >
              Carousels → Home page
            </Link>
            .
          </p>
        </AdminCard>

        <AdminIconButton
          type="submit"
          label="Save homepage content"
          icon="save"
          variant="primary"
          showLabel
        />
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-xl border border-outline-variant/25 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant/20 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Live preview
            </p>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open live site
            </a>
          </div>

          <div className="bg-[linear-gradient(160deg,#5c1a1a_0%,#8b2e2e_45%,#c4a574_100%)] px-3 py-2 text-center text-[11px] font-semibold text-white">
            {announcement || "Announcement bar"}
          </div>

          <div className="relative aspect-video bg-surface-container-low">
            {previewSlide?.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSlide.src}
                alt={previewSlide.alt || "Hero slide"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-on-surface-variant">
                No home slides yet
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 to-transparent p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                Hero
              </p>
              <p className="truncate text-sm font-semibold text-white">
                {previewSlide?.alt || "Hero slide"}
              </p>
            </div>
          </div>

          <div className="border-t border-outline-variant/15 bg-[#faf6f0] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Celebration
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-on-surface">
              {celebrationTitle || "Celebration title"}
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">
              {celebrationBody || "Celebration body"}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
