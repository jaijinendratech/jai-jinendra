import type { Metadata } from "next";
import { getHeroCarouselContent, getIntegrationStatus } from "@/lib/admin/queries";
import { saveCarouselSlidesAction } from "@/lib/admin/actions";
import { AdminPageHeader, NoticeBanner } from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { CarouselEditor } from "./CarouselEditor";

export const metadata: Metadata = {
  title: "Admin · Carousels",
  robots: { index: false, follow: false },
};

export default async function AdminCarouselsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const { supabase } = getIntegrationStatus();
  const slides = await getHeroCarouselContent();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Carousels"
        description={
          supabase
            ? "Homepage hero slides in content_blocks (home / hero_slides)."
            : "Editing UI over static hero slides — connect Supabase to persist."
        }
      />
      <NoticeBanner notice={notice} />

      <form
        action={saveCarouselSlidesAction}
        className="space-y-4 rounded-xl border border-outline-variant/25 bg-white p-6 shadow-sm"
      >
        <CarouselEditor initial={slides} />
        <AdminIconButton
          type="submit"
          label="Save carousel slides"
          icon="save"
          variant="primary"
        />
      </form>
    </div>
  );
}
