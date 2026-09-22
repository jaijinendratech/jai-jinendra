import type { Metadata } from "next";
import { getAdminCombos, getIntegrationStatus } from "@/lib/admin/queries";
import { AdminPageHeader, NoticeBanner } from "@/components/admin/ui";
import { CombosManager } from "./CombosManager";

export const metadata: Metadata = {
  title: "Admin · Combos",
  robots: { index: false, follow: false },
};

export default async function AdminCombosPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const data = await getAdminCombos();
  const { supabase } = getIntegrationStatus();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Combos"
        description="Curated boxes and gift sets that sell themselves."
      />
      <NoticeBanner notice={notice} />
      <CombosManager
        boxes={data.boxes.map((b) => ({
          id: b.id,
          slug: b.slug,
          name: b.name,
          description: b.description ?? null,
          price: b.price,
          mrp: b.mrp,
          sku: b.sku ?? "",
          sortOrder: b.sortOrder,
          slots: "slots" in b ? b.slots : undefined,
          published: b.published,
          featured: b.featured,
          imageUrl: b.imageUrl ?? null,
        }))}
        pool={data.pool}
        source={data.source}
        supabase={supabase}
      />
    </div>
  );
}
