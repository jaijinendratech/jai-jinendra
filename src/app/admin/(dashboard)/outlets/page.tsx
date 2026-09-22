import type { Metadata } from "next";
import { getAdminOutlets, getIntegrationStatus } from "@/lib/admin/queries";
import { AdminPageHeader, NoticeBanner } from "@/components/admin/ui";
import { OutletsManager } from "./OutletsManager";

export const metadata: Metadata = {
  title: "Admin · Outlets",
  robots: { index: false, follow: false },
};

export default async function AdminOutletsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const outlets = await getAdminOutlets();
  const { supabase } = getIntegrationStatus();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Outlets"
        description="Flagship stores people can visit in person."
      />
      <NoticeBanner notice={notice} />
      <OutletsManager
        outlets={outlets.map((o) => ({
          id: o.id,
          name: o.name,
          address: o.address,
          phone: o.phone ?? null,
          hours: o.hours ?? null,
          city: o.city ?? "",
          lat: o.lat,
          lng: o.lng,
          sortOrder: o.sortOrder,
          published: o.published,
        }))}
        supabase={supabase}
      />
    </div>
  );
}
