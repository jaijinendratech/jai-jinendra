import type { Metadata } from "next";
import {
  getContentBlock,
  getHeroCarouselContent,
  getIntegrationStatus,
} from "@/lib/admin/queries";
import { saveHomepageContentAction } from "@/lib/admin/actions";
import { siteConfig, celebrationBanner } from "@/data/home";
import {
  AdminCard,
  AdminPageHeader,
  NoticeBanner,
  fieldClassName,
  labelClassName,
  primaryBtnClassName,
} from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Admin · Homepage content",
  robots: { index: false, follow: false },
};

export default async function AdminHomeContentPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const { supabase } = getIntegrationStatus();
  const slides = await getHeroCarouselContent();
  const announcementBlock = await getContentBlock("home", "announcement");
  const celebrationBlock = await getContentBlock("home", "celebration");

  const announcement =
    (announcementBlock?.content as { text?: string } | null)?.text ??
    siteConfig.announcement;
  const celebration = (celebrationBlock?.content as {
    title?: string;
    body?: string;
  } | null) ?? {
    title: celebrationBanner.title,
    body: celebrationBanner.body,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Homepage content"
        description={
          supabase
            ? "Persists to content_blocks."
            : "Editing UI over static defaults — connect Supabase to save."
        }
      />
      <NoticeBanner notice={notice} />

      <form action={saveHomepageContentAction} className="space-y-5">
        <AdminCard title="Announcement">
          <label className={labelClassName()}>
            Announcement bar
            <textarea
              name="announcement"
              rows={2}
              defaultValue={announcement}
              className={fieldClassName()}
            />
          </label>
        </AdminCard>

        <AdminCard title="Hero slides">
          <input type="hidden" name="heroSlidesJson" value={JSON.stringify(slides)} />
          <div className="space-y-3">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-3"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Slide {index + 1} · {slide.id}
                </p>
                <p className="mt-2 text-xs text-on-surface-variant">Src: {slide.src}</p>
                <p className="mt-1 text-xs text-on-surface-variant">Alt: {slide.alt}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-on-surface-variant">
            Manage slide src/alt on the{" "}
            <a href="/admin/content/carousels" className="font-semibold text-primary hover:underline">
              Carousels
            </a>{" "}
            page. Saving here keeps the current slide JSON.
          </p>
        </AdminCard>

        <AdminCard title="Celebration banner">
          <label className={labelClassName()}>
            Title
            <input
              name="celebrationTitle"
              defaultValue={celebration.title ?? ""}
              className={fieldClassName()}
            />
          </label>
          <label className={`${labelClassName()} mt-3`}>
            Body
            <textarea
              name="celebrationBody"
              rows={3}
              defaultValue={celebration.body ?? ""}
              className={fieldClassName()}
            />
          </label>
        </AdminCard>

        <button type="submit" className={primaryBtnClassName()}>
          Save homepage content
        </button>
      </form>
    </div>
  );
}
