import type { Metadata } from "next";
import {
  CAROUSEL_PAGE_KEYS,
  getHeroCarouselContent,
  type CarouselPageKey,
} from "@/lib/admin/queries";
import { AdminPageHeader, NoticeBanner } from "@/components/admin/ui";
import { CarouselsManager } from "./CarouselsManager";

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

  const slidesByPage = {} as Record<
    CarouselPageKey,
    { id: string; src: string; alt: string }[]
  >;
  await Promise.all(
    CAROUSEL_PAGE_KEYS.map(async ({ key }) => {
      slidesByPage[key] = await getHeroCarouselContent(key);
    }),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Carousels"
        description="Hero slides that greet every visitor."
      />
      <NoticeBanner notice={notice} />
      <CarouselsManager slidesByPage={slidesByPage} />
    </div>
  );
}
