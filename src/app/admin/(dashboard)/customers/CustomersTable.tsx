"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatINR } from "@/lib/format";
import type { AdminCustomer, AdminOrderListItem } from "@/lib/admin/queries";
import { loadAdminCustomerAction } from "@/lib/admin/actions";
import { AdminTableShell, AdminEmpty } from "@/components/admin/ui";
import { SearchField } from "@/components/admin/SearchField";
import { AdminDrawer } from "@/components/admin/AdminDrawer";
import {
  AdminTablePagination,
  useAdminTablePagination,
} from "@/components/admin/AdminTablePagination";
import { CustomerDetailPanel } from "./CustomerDetailPanel";

export function CustomersTable({
  customers,
  supabase,
}: {
  customers: AdminCustomer[];
  supabase: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    customer: AdminCustomer;
    orders: AdminOrderListItem[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((c) =>
      `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(needle),
    );
  }, [customers, q]);

  const { pageItems, page, setPage, totalPages, total, from, to } =
    useAdminTablePagination(filtered);

  const syncQuery = useCallback(
    (customerId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (customerId) params.set("customer", customerId);
      else params.delete("customer");
      const qs = params.toString();
      router.replace(qs ? `/admin/customers?${qs}` : "/admin/customers", {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const openCustomer = useCallback(
    async (id: string) => {
      setOpenId(id);
      setLoading(true);
      setLoadError(null);
      setDetail(null);
      syncQuery(id);
      try {
        const data = await loadAdminCustomerAction(id);
        if (!data) {
          setLoadError("Customer not found.");
          return;
        }
        setDetail(data);
      } catch {
        setLoadError("Could not load customer.");
      } finally {
        setLoading(false);
      }
    },
    [syncQuery],
  );

  const closeCustomer = useCallback(() => {
    setOpenId(null);
    setDetail(null);
    setLoadError(null);
    syncQuery(null);
  }, [syncQuery]);

  useEffect(() => {
    const fromQuery = searchParams.get("customer");
    if (fromQuery && fromQuery !== openId) {
      void openCustomer(fromQuery);
    }
    // Only react to URL deep-links, not every openId change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <SearchField
        value={q}
        onChange={(value) => {
          setQ(value);
          setPage(1);
        }}
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
        <>
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
              {pageItems.map((c) => (
                <tr
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer hover:bg-surface-container-low/50"
                  onClick={() => void openCustomer(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      void openCustomer(c.id);
                    }
                  }}
                >
                  <td className="px-4 py-3 font-semibold text-primary">
                    {c.name}
                  </td>
                  <td className="px-4 py-3">
                    <p>{c.email || "—"}</p>
                    <p className="text-xs text-on-surface-variant">
                      {c.phone || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">{c.orderCount}</td>
                  <td className="px-4 py-3 price font-semibold">
                    {formatINR(c.spent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
        <AdminTablePagination
          page={page}
          totalPages={totalPages}
          total={total}
          from={from}
          to={to}
          onPageChange={setPage}
        />
        </>
      )}

      <AdminDrawer
        isOpen={openId !== null}
        onOpenChange={(open) => {
          if (!open) closeCustomer();
        }}
        title={
          detail?.customer.name ??
          (loading ? "Loading…" : loadError ? "Customer" : "Customer")
        }
      >
        {loading ? (
          <p className="py-8 text-sm text-on-surface-variant">
            Loading customer…
          </p>
        ) : loadError ? (
          <p className="py-8 text-sm text-red-700" role="alert">
            {loadError}
          </p>
        ) : detail ? (
          <CustomerDetailPanel
            customer={detail.customer}
            orders={detail.orders}
            supabase={supabase}
            onSaved={() => {
              if (openId) void openCustomer(openId);
            }}
          />
        ) : null}
      </AdminDrawer>
    </div>
  );
}
