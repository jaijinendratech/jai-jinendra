import type { Metadata } from "next";
import { formatINR } from "@/lib/format";
import { getAdminInventory, getIntegrationStatus } from "@/lib/admin/queries";
import { adjustInventoryAction } from "@/lib/admin/actions";
import {
  AdminPageHeader,
  AdminTableShell,
  StatusBadge,
  fieldClassName,
  primaryBtnClassName,
} from "@/components/admin/ui";

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
        description={
          supabase
            ? "Variant stock with inventory_logs on adjust."
            : "Catalogue variant stock preview (read-only without Supabase)."
        }
      />

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
            {rows.map((row) => {
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
                      <form
                        action={adjustInventoryAction}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input type="hidden" name="variantId" value={row.id} />
                        <input
                          name="delta"
                          type="number"
                          placeholder="+/-"
                          required
                          className={`${fieldClassName()} mt-0! w-20`}
                        />
                        <input
                          name="reason"
                          defaultValue="manual_adjust"
                          className={`${fieldClassName()} mt-0! w-32`}
                        />
                        <button
                          type="submit"
                          className={`${primaryBtnClassName()} px-2! py-1! text-xs`}
                        >
                          Apply
                        </button>
                      </form>
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
    </div>
  );
}
