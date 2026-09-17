import type { Metadata } from "next";
import { formatINR } from "@/lib/format";
import { getAdminCustomers, getIntegrationStatus } from "@/lib/admin/queries";
import {
  AdminPageHeader,
  AdminTableShell,
  AdminEmpty,
} from "@/components/admin/ui";

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
        description={
          supabase
            ? "Profiles with order counts when available."
            : "Derived from mock orders (Supabase offline)."
        }
      />

      {!customers.length ? (
        <AdminEmpty
          title="No customers yet"
          description="Customer profiles appear after sign-ups or orders."
        />
      ) : (
        <AdminTableShell>
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-outline-variant/20 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Orders</th>
                <th className="px-4 py-3 font-semibold">Spent</th>
                <th className="px-4 py-3 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3">
                    <p>{c.email || "—"}</p>
                    <p className="text-xs text-on-surface-variant">{c.phone || "—"}</p>
                  </td>
                  <td className="px-4 py-3">{c.orderCount}</td>
                  <td className="px-4 py-3 price font-semibold">{formatINR(c.spent)}</td>
                  <td className="px-4 py-3 capitalize text-on-surface-variant">{c.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      )}
    </div>
  );
}
