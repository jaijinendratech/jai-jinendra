import type { Metadata } from "next";
import {
  getAchievementMediaContent,
  getAchievementPageContent,
} from "@/lib/admin/queries";
import { AdminPageHeader, NoticeBanner } from "@/components/admin/ui";
import { AchievementsEditor } from "./AchievementsEditor";

export const metadata: Metadata = {
  title: "Admin · Achievements",
  robots: { index: false, follow: false },
};

export default async function AdminAchievementsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { notice, error } = await searchParams;
  const [media, page] = await Promise.all([
    getAchievementMediaContent(),
    getAchievementPageContent(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Achievements"
        description="Homepage media gallery and the public achievement page."
      />
      <NoticeBanner notice={notice} error={error} />
      <AchievementsEditor media={media} page={page} />
    </div>
  );
}
