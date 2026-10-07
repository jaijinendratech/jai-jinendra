"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "@heroui/react";
import { isNextRedirectError } from "@/lib/admin/is-redirect-error";
import { saveHomepageContentAction } from "@/lib/admin/actions";
import {
  AdminCard,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import {
  FESTIVE_SPECIAL_MAX_PRODUCTS,
  type FestiveSpecialContent,
} from "@/lib/catalog/festive";
import {
  FestiveProductPicker,
  type FestiveProductOption,
} from "./FestiveProductPicker";

type Slide = { id: string; src: string; alt: string };

export function HomepageContentEditor({
  announcement: initialAnnouncement,
  celebrationTitle: initialTitle,
  celebrationBody: initialBody,
  thaliDiscountPercent: initialThaliDiscountPercent,
  festive: initialFestive,
  productOptions,
  slides,
}: {
  announcement: string;
  celebrationTitle: string;
  celebrationBody: string;
  thaliDiscountPercent: number;
  festive: FestiveSpecialContent;
  productOptions: FestiveProductOption[];
  slides: Slide[];
}) {
  const [announcement, setAnnouncement] = useState(initialAnnouncement);
  const [celebrationTitle, setCelebrationTitle] = useState(initialTitle);
  const [celebrationBody, setCelebrationBody] = useState(initialBody);
  const [thaliDiscountPercent, setThaliDiscountPercent] = useState(
    initialThaliDiscountPercent,
  );
  const [festive, setFestive] = useState(initialFestive);
  const setFest = <K extends keyof FestiveSpecialContent>(
    key: K,
    value: FestiveSpecialContent[K],
  ) => setFestive((f) => ({ ...f, [key]: value }));
  const previewSlide = slides[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
      <form
        action={async (formData) => {
          try {
            await saveHomepageContentAction(formData);
            toast.success("Homepage content saved");
          } catch (err) {
            if (isNextRedirectError(err)) throw err;
            toast.danger(
              err instanceof Error ? err.message : "Could not save homepage content.",
            );
          }
        }}
        className="space-y-5"
      >
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

        <AdminCard title="Festive special section">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              name="festiveEnabled"
              checked={festive.enabled}
              onChange={(e) => setFest("enabled", e.target.checked)}
            />
            Show this section on the home page
          </label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className={labelClassName()}>
              Small label
              <input
                name="festiveEyebrow"
                value={festive.eyebrow}
                onChange={(e) => setFest("eyebrow", e.target.value)}
                className={fieldClassName()}
              />
            </label>
            <label className={labelClassName()}>
              Heading (e.g. Diwali Specials)
              <input
                name="festiveTitle"
                value={festive.title}
                onChange={(e) => setFest("title", e.target.value)}
                className={fieldClassName()}
              />
            </label>
          </div>
          <label className={`${labelClassName()} mt-3`}>
            Subtitle
            <textarea
              name="festiveSubtitle"
              rows={2}
              value={festive.subtitle}
              onChange={(e) => setFest("subtitle", e.target.value)}
              className={fieldClassName()}
            />
          </label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className={labelClassName()}>
              Button text (blank hides the button)
              <input
                name="festiveButtonLabel"
                value={festive.buttonLabel}
                onChange={(e) => setFest("buttonLabel", e.target.value)}
                className={fieldClassName()}
              />
            </label>
            <label className={labelClassName()}>
              Button link
              <input
                name="festiveButtonHref"
                value={festive.buttonHref}
                onChange={(e) => setFest("buttonHref", e.target.value)}
                placeholder="/catalogue/sweets"
                className={fieldClassName()}
              />
            </label>
          </div>
          <label className={`${labelClassName()} mt-3`}>
            Festival tag (creates the page /catalogue/&lt;tag&gt;)
            <input
              name="festiveCollectionTag"
              value={festive.collectionTag}
              onChange={(e) => setFest("collectionTag", e.target.value)}
              placeholder="Navratri Special"
              className={fieldClassName()}
            />
          </label>
          <p className="mt-1 text-xs text-on-surface-variant">
            Add this exact tag to any product (Products → Tags) and it joins the
            festival page automatically. Must end with &ldquo;Special&rdquo;,
            e.g. Diwali Special becomes /catalogue/diwali-special. With no
            products picked below, the home section shows the first 4 tagged
            products.
          </p>
          <p className={`${labelClassName()} mt-4`}>
            Products shown (up to {FESTIVE_SPECIAL_MAX_PRODUCTS}, in this order)
          </p>
          <div className="mt-1.5">
            <FestiveProductPicker
              options={productOptions}
              selected={festive.productIds}
              onChange={(ids) => setFest("productIds", ids)}
              max={FESTIVE_SPECIAL_MAX_PRODUCTS}
            />
          </div>
          <p className="mt-2 text-xs text-on-surface-variant">
            Changes here go live only after you press &ldquo;Save homepage
            content&rdquo; at the bottom of the page.
          </p>
        </AdminCard>

        <AdminCard title="Build Your Thali offer">
          <label className={labelClassName()}>
            % off shown when a shopper completes the thali
            <input
              name="thaliDiscountPercent"
              type="number"
              min={1}
              max={100}
              value={thaliDiscountPercent}
              onChange={(e) =>
                setThaliDiscountPercent(Number(e.target.value))
              }
              className={fieldClassName()}
            />
          </label>
          <p className="mt-2 text-xs text-on-surface-variant">
            Shown as a badge on the home page once every thali slot is
            filled. Items still add to the cart at their regular price, see
            the launch notes before relying on this as an enforced discount.
          </p>
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
