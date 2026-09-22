import type { Metadata } from "next";
import {
  getContentBlock,
  getHeroCarouselContent,
} from "@/lib/admin/queries";
import { siteConfig, celebrationBanner } from "@/data/home";
import { AdminPageHeader, NoticeBanner } from "@/components/admin/ui";
import { HomepageContentEditor } from "./HomepageContentEditor";

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
  const slides = await getHeroCarouselContent("home");
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
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Homepage content"
        description="Tune the welcome — announcements and celebration moments."
      />
      <NoticeBanner notice={notice} />

      <HomepageContentEditor
        announcement={announcement}
        celebrationTitle={celebration.title ?? ""}
        celebrationBody={celebration.body ?? ""}
        slides={slides}
      />
    </div>
  );
}
