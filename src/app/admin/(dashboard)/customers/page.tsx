import type { Metadata } from "next";
import { Suspense } from "react";
import { getAdminCustomers, getIntegrationStatus } from "@/lib/admin/queries";
import { AdminPageHeader, AdminEmpty } from "@/components/admin/ui";
import { CustomersTable } from "./CustomersTable";

export const metadata: Metadata = {
  title: "Admin · Customers",
  robots: { index: false, follow: false },
};

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();
  const { supabase } = getIntegrationStatus();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers"
        description="Who’s buying — open a row to view and greet them."
      />

      {!customers.length ? (
        <AdminEmpty
          title="No customers yet"
          description="Customer profiles appear after sign-ups or orders."
        />
      ) : (
        <Suspense fallback={<p className="text-sm text-on-surface-variant">Loading…</p>}>
          <CustomersTable customers={customers} supabase={supabase} />
        </Suspense>
      )}
    </div>
  );
}
