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
import { isSyntheticPhoneEmail } from "@/lib/customers";
import { CustomerDetailPanel } from "./CustomerDetailPanel";

function CustomerContactCell({ customer }: { customer: AdminCustomer }) {
  if (isSyntheticPhoneEmail(customer.email)) {
    return (
      <>
        <p className="font-medium">{customer.phone || ", "}</p>
        <p className="text-xs text-on-surface-variant">Phone login</p>
      </>
    );
  }
  return (
    <>
      <p>{customer.email || ", "}</p>
      <p className="text-xs text-on-surface-variant">{customer.phone || ", "}</p>
    </>
  );
}

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
  const [result, setResult] = useState<{
    id: string;
    detail?: { customer: AdminCustomer; orders: AdminOrderListItem[] };
    error?: string;
  } | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Result for a different (or no) customer means the current one is loading.
  const current = openId && result?.id === openId ? result : null;
  const detail = current?.detail ?? null;
  const loadError = current?.error ?? null;
  const loading = openId !== null && !current;

  // Open the drawer for URL deep-links (?customer=<id>).
  const fromQuery = searchParams.get("customer");
  const [prevQuery, setPrevQuery] = useState<string | null>(null);
  if (fromQuery !== prevQuery) {
    setPrevQuery(fromQuery);
    if (fromQuery && fromQuery !== openId) setOpenId(fromQuery);
  }

  useEffect(() => {
    if (!openId) return;
    let cancelled = false;
    loadAdminCustomerAction(openId)
      .then((data) => {
        if (cancelled) return;
        setResult(
          data
            ? { id: openId, detail: data }
            : { id: openId, error: "Customer not found." },
        );
      })
      .catch(() => {
        if (!cancelled) setResult({ id: openId, error: "Could not load customer." });
      });
    return () => {
      cancelled = true;
    };
  }, [openId, reloadToken]);

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

  const reloadCustomer = useCallback(() => {
    setResult(null);
    setReloadToken((n) => n + 1);
  }, []);

  const openCustomer = useCallback(
    (id: string) => {
      if (id === openId) {
        reloadCustomer();
        return;
      }
      setOpenId(id);
      setResult(null);
      syncQuery(id);
    },
    [openId, reloadCustomer, syncQuery],
  );

  const closeCustomer = useCallback(() => {
    setOpenId(null);
    setResult(null);
    syncQuery(null);
  }, [syncQuery]);

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
                  data-customer-id={c.id}
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
                      <CustomerContactCell customer={c} />
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
        size="xl"
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
          <p
            className="py-8 text-sm text-on-surface-variant"
            aria-busy="true"
            aria-live="polite"
          >
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
            onSaved={reloadCustomer}
          />
        ) : null}
      </AdminDrawer>
    </div>
  );
}
