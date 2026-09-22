import type { Metadata } from "next";
import { getAdminOrders, getIntegrationStatus } from "@/lib/admin/queries";
import { AdminPageHeader } from "@/components/admin/ui";
import { OrdersFilters } from "./OrdersFilters";
import { OrdersTable } from "./OrdersTable";

export const metadata: Metadata = {
  title: "Admin · Orders",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string }>;
}) {
  const params = await searchParams;
  const all = await getAdminOrders();
  const { supabase } = getIntegrationStatus();

  const q = (params.q ?? "").toLowerCase();
  const orders = all.filter((o) => {
    if (params.status && params.status !== "all" && o.status !== params.status) return false;
    if (params.payment && params.payment !== "all" && o.paymentStatus !== params.payment)
      return false;
    if (!q) return true;
    return `${o.id} ${o.customer} ${o.email} ${o.city}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="Follow every order from kitchen to doorstep."
      />

      <OrdersFilters
        q={params.q ?? ""}
        status={params.status ?? "all"}
        payment={params.payment ?? "all"}
      />

      <OrdersTable orders={orders} supabase={supabase} />
    </div>
  );
}
