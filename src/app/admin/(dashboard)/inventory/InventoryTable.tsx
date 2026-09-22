"use client";

import { formatINR } from "@/lib/format";
import { AdminTableShell, StatusBadge } from "@/components/admin/ui";
import { InventoryAdjustForm } from "@/components/admin/InventoryAdjustForm";
import {
  AdminTablePagination,
  useAdminTablePagination,
} from "@/components/admin/AdminTablePagination";

export type AdminInventoryRow = {
  id: string;
  productId: string;
  productName: string;
  label: string;
  sku: string;
  stockQty: number;
  threshold: number;
  available: boolean;
  price: number;
};

export function InventoryTable({
  rows,
  supabase,
}: {
  rows: AdminInventoryRow[];
  supabase: boolean;
}) {
  const { pageItems, page, setPage, totalPages, total, from, to } =
    useAdminTablePagination(rows);

  return (
    <>
      <AdminTableShell>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-outline-variant/20 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Variant</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {pageItems.map((row) => {
              const stockKind =
                row.stockQty <= 0
                  ? "out"
                  : row.stockQty <= row.threshold
                    ? "low"
                    : "ok";
              return (
                <tr key={`${row.productId}-${row.id}-${row.sku}`}>
                  <td className="px-4 py-3 font-semibold">{row.productName}</td>
                  <td className="px-4 py-3">{row.label}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.sku}</td>
                  <td className="px-4 py-3 price">{formatINR(row.price)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      kind="stock"
                      value={stockKind}
                      label={String(row.stockQty)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {supabase ? (
                      <InventoryAdjustForm variantId={row.id} />
                    ) : (
                      <span className="text-xs text-on-surface-variant">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
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
  );
}
