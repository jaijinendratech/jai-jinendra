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
} from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { CarouselEditor } from "../carousels/CarouselEditor";

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
          <CarouselEditor initial={slides} jsonFieldName="heroSlidesJson" />
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

        <AdminIconButton
          type="submit"
          label="Save homepage content"
          icon="save"
          variant="primary"
        />
      </form>
    </div>
  );
}
