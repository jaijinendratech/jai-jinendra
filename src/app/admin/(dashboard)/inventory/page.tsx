import type { Metadata } from "next";
import { getAdminInventory, getIntegrationStatus } from "@/lib/admin/queries";
import { AdminPageHeader } from "@/components/admin/ui";
import { InventoryTable } from "./InventoryTable";

export const metadata: Metadata = {
  title: "Admin · Inventory",
  robots: { index: false, follow: false },
};

export default async function AdminInventoryPage() {
  const rows = await getAdminInventory();
  const { supabase } = getIntegrationStatus();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Inventory"
        description="Keep every variant stocked before shelves run dry."
      />

      <InventoryTable rows={rows} supabase={supabase} />
    </div>
  );
}
