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
  searchParams: Promise<{
    q?: string;
    status?: string;
    payment?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const { orders, total, page, pageSize } = await getAdminOrders({
    q: params.q,
    status: params.status,
    payment: params.payment,
    page: Number(params.page) || 1,
  });
  const { supabase } = getIntegrationStatus();

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

      <OrdersTable
        orders={orders}
        supabase={supabase}
        page={page}
        pageSize={pageSize}
        total={total}
      />
    </div>
  );
}
