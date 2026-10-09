"use client";

import { useMemo, useState } from "react";
import { formatINR } from "@/lib/format";
import {
  AdminTableShell,
  StatusBadge,
  fieldClassName,
} from "@/components/admin/ui";
import { SearchField } from "@/components/admin/SearchField";
import { InventoryAdjustForm } from "@/components/admin/InventoryAdjustForm";
import {
  AdminTablePagination,
  useAdminTablePagination,
} from "@/components/admin/AdminTablePagination";

export type AdminInventoryRow = {
  id: string;
  productId: string;
  productName: string;
  category: string;
  label: string;
  sku: string;
  stockQty: number;
  threshold: number;
  available: boolean;
  price: number;
};

type StockKind = "out" | "low" | "ok";
type StockFilter = "all" | StockKind;
type SortKey = "name" | "sku" | "stock-asc" | "stock-desc" | "price";

function stockKindOf(row: AdminInventoryRow): StockKind {
  if (row.stockQty <= 0) return "out";
  return row.stockQty <= row.threshold ? "low" : "ok";
}

export function InventoryTable({
  rows,
  supabase,
}: {
  rows: AdminInventoryRow[];
  supabase: boolean;
}) {
  const [q, setQ] = useState("");
  const [stock, setStock] = useState<StockFilter>("all");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState<"all" | "yes" | "no">("all");
  const [sort, setSort] = useState<SortKey>("name");

  const categoryOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category))).sort(),
    [rows],
  );
  const counts = useMemo(() => {
    const c = { out: 0, low: 0 };
    for (const r of rows) {
      const kind = stockKindOf(r);
      if (kind === "out") c.out += 1;
      else if (kind === "low") c.low += 1;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter((r) => {
        if (
          needle &&
          !`${r.productName} ${r.label} ${r.sku}`.toLowerCase().includes(needle)
        ) {
          return false;
        }
        if (stock !== "all" && stockKindOf(r) !== stock) return false;
        if (category !== "all" && r.category !== category) return false;
        if (availability === "yes" && !r.available) return false;
        if (availability === "no" && r.available) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sort) {
          case "sku":
            return a.sku.localeCompare(b.sku);
          case "stock-asc":
            return a.stockQty - b.stockQty;
          case "stock-desc":
            return b.stockQty - a.stockQty;
          case "price":
            return a.price - b.price;
          default:
            return (
              a.productName.localeCompare(b.productName) ||
              a.label.localeCompare(b.label)
            );
        }
      });
  }, [rows, q, stock, category, availability, sort]);

  const filtersActive =
    Boolean(q.trim()) ||
    stock !== "all" ||
    category !== "all" ||
    availability !== "all";

  const { pageItems, page, setPage, totalPages, total, from, to } =
    useAdminTablePagination(filtered);

  const selectClass = `${fieldClassName()} mt-0! max-w-48`;
  const chipClass = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-semibold transition ${
      active
        ? "border-primary bg-primary text-white"
        : "border-outline-variant/40 bg-white text-on-surface-variant hover:border-primary"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchField
          value={q}
          onChange={(value) => {
            setQ(value);
            setPage(1);
          }}
          placeholder="Search product, variant or SKU…"
        />
        <select
          value={stock}
          onChange={(e) => {
            setStock(e.target.value as StockFilter);
            setPage(1);
          }}
          className={selectClass}
          aria-label="Filter by stock level"
        >
          <option value="all">All stock levels</option>
          <option value="out">Out of stock</option>
          <option value="low">Low stock</option>
          <option value="ok">In stock</option>
        </select>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className={selectClass}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={availability}
          onChange={(e) => {
            setAvailability(e.target.value as "all" | "yes" | "no");
            setPage(1);
          }}
          className={selectClass}
          aria-label="Filter by availability"
        >
          <option value="all">Any availability</option>
          <option value="yes">Available</option>
          <option value="no">Hidden</option>
        </select>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as SortKey);
            setPage(1);
          }}
          className={selectClass}
          aria-label="Sort inventory"
        >
          <option value="name">Sort: product A-Z</option>
          <option value="sku">Sort: SKU</option>
          <option value="stock-asc">Sort: stock low to high</option>
          <option value="stock-desc">Sort: stock high to low</option>
          <option value="price">Sort: price</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
        <button
          type="button"
          onClick={() => {
            setStock(stock === "out" ? "all" : "out");
            setPage(1);
          }}
          className={chipClass(stock === "out")}
        >
          Out of stock ({counts.out})
        </button>
        <button
          type="button"
          onClick={() => {
            setStock(stock === "low" ? "all" : "low");
            setPage(1);
          }}
          className={chipClass(stock === "low")}
        >
          Low stock ({counts.low})
        </button>
        <span>
          Showing {filtered.length} of {rows.length} variants
        </span>
        {filtersActive ? (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setStock("all");
              setCategory("all");
              setAvailability("all");
              setPage(1);
            }}
            className="font-semibold text-primary hover:underline"
          >
            Clear filters
          </button>
        ) : null}
      </div>

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
            {pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-on-surface-variant"
                >
                  No variants match these filters.
                </td>
              </tr>
            ) : null}
            {pageItems.map((row) => (
              <tr key={`${row.productId}-${row.id}-${row.sku}`}>
                <td className="px-4 py-3 font-semibold">
                  {row.productName}
                  <span className="block text-xs font-normal text-on-surface-variant">
                    {row.category}
                  </span>
                </td>
                <td className="px-4 py-3">{row.label}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.sku}</td>
                <td className="px-4 py-3 price">{formatINR(row.price)}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    kind="stock"
                    value={stockKindOf(row)}
                    label={String(row.stockQty)}
                  />
                </td>
                <td className="px-4 py-3">
                  {supabase ? (
                    <InventoryAdjustForm variantId={row.id} />
                  ) : (
                    <span className="text-xs text-on-surface-variant">, </span>
                  )}
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
    </div>
  );
}
