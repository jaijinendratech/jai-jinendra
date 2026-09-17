"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/format";
import type { AdminCustomer } from "@/lib/admin/queries";
import { AdminTableShell, AdminEmpty } from "@/components/admin/ui";
import { SearchField } from "@/components/admin/SearchField";

export function CustomersTable({ customers }: { customers: AdminCustomer[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((c) =>
      `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(needle),
    );
  }, [customers, q]);

  return (
    <div className="space-y-4">
      <SearchField
        value={q}
        onChange={setQ}
        placeholder="Search name, email, phone…"
      />

      {!filtered.length ? (
        <AdminEmpty
          title={q ? "No customers match" : "No customers yet"}
          description={
            q
              ? "Try a different name, email, or phone."
              : "Customer profiles appear after sign-ups or orders."
          }
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
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  role="link"
                  tabIndex={0}
                  className="cursor-pointer hover:bg-surface-container-low/50"
                  onClick={() => router.push(`/admin/customers/${c.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/admin/customers/${c.id}`);
                    }
                  }}
                >
                  <td className="px-4 py-3 font-semibold text-primary">{c.name}</td>
                  <td className="px-4 py-3">
                    <p>{c.email || "—"}</p>
                    <p className="text-xs text-on-surface-variant">{c.phone || "—"}</p>
                  </td>
                  <td className="px-4 py-3">{c.orderCount}</td>
                  <td className="px-4 py-3 price font-semibold">{formatINR(c.spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      )}
    </div>
  );
}
