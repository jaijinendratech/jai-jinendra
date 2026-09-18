"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatINR } from "@/lib/format";
import type { AdminProductListItem } from "@/lib/admin/queries";
import { setProductPublishedAction } from "@/lib/admin/actions";
import { StatusBadge, fieldClassName } from "@/components/admin/ui";
import {
  AdminStatusSelect,
  PUBLISH_DRAFT_OPTIONS,
} from "@/components/admin/AdminStatusSelect";
import { SearchField } from "@/components/admin/SearchField";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import {
  ProductFormModal,
  preloadProductForm,
  type ProductModalState,
} from "@/components/admin/ProductEditModal";
import { AdminIconButton } from "@/components/admin/AdminIconButton";

export function ProductsTable({
  products,
  categories,
  supabaseOn,
}: {
  products: AdminProductListItem[];
  categories: { id: string; title: string }[];
  supabaseOn: boolean;
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("name");
  const [modal, setModal] = useState<ProductModalState>(null);

  const categoryOptions = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    let rows = products.filter((p) => {
      const hay = `${p.name} ${p.slug} ${p.category}`.toLowerCase();
      if (q && !hay.includes(q.toLowerCase())) return false;
      if (category !== "all" && p.category !== category) return false;
      return true;
    });
    rows = rows.slice().sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "stock") return a.stockQty - b.stockQty;
      return a.name.localeCompare(b.name);
    });
    return rows;
  }, [products, q, category, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchField
          value={q}
          onChange={setQ}
          placeholder="Search products…"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`${fieldClassName()} max-w-45 mt-0!`}
        >
          <option value="all">All categories</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className={`${fieldClassName()} max-w-40 mt-0!`}
        >
          <option value="name">Sort: name</option>
          <option value="price">Sort: price</option>
          <option value="stock">Sort: stock</option>
        </select>
        <div className="ml-auto">
          <AdminIconButton
            label="Add product"
            icon="plus"
            variant="primary"
            showLabel
            onClick={() => {
              preloadProductForm();
              setModal({ mode: "create" });
            }}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-outline-variant/25 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-outline-variant/20 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Variants</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="w-12 px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {filtered.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-surface-container-low/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-surface-container">
                      <Image
                        src={product.image || "/images/prod0.jpg"}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">
                        {product.name}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {product.slug}
                      </p>
                      {product.featured ? (
                        <span className="text-[10px] font-bold uppercase text-primary">
                          Featured
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{product.category}</td>
                <td className="px-4 py-3">{product.variantCount}</td>
                <td className="px-4 py-3 price font-semibold">
                  {formatINR(product.price)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    kind="stock"
                    value={
                      product.stockQty <= 0
                        ? "out"
                        : product.stockQty <= 5
                          ? "low"
                          : "ok"
                    }
                    label={String(product.stockQty)}
                  />
                </td>
                <td className="px-4 py-3">
                  {supabaseOn ? (
                    <AdminStatusSelect
                      action={setProductPublishedAction}
                      fields={{ id: product.id }}
                      name="published"
                      value={String(product.published)}
                      options={PUBLISH_DRAFT_OPTIONS}
                      kind="publish"
                    />
                  ) : (
                    <span
                      className={`text-xs font-semibold ${
                        product.published ? "text-emerald-700" : "text-zinc-500"
                      }`}
                    >
                      {product.published ? "Published" : "Draft"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <ProductRowActions
                    product={product}
                    supabaseOn={supabaseOn}
                    onEdit={(id) => setModal({ mode: "edit", productId: id })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filtered.length ? (
        <p className="text-center text-sm text-on-surface-variant">
          No products match.
        </p>
      ) : null}

      <ProductFormModal
        state={modal}
        categories={categories}
        supabase={supabaseOn}
        onClose={() => setModal(null)}
        onCreated={(productId) => setModal({ mode: "edit", productId })}
      />
    </div>
  );
}
