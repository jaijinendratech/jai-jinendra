"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "@heroui/react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LuGripVertical } from "react-icons/lu";
import { formatINR } from "@/lib/format";
import type { AdminProductListItem } from "@/lib/admin/queries";
import {
  reorderProductsAction,
  setProductPublishedAction,
  setProductSortNumberAction,
} from "@/lib/admin/actions";
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
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/catalog/placeholder";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import {
  AdminTablePagination,
  useAdminTablePagination,
} from "@/components/admin/AdminTablePagination";

export function ProductsTable({
  products,
  categories,
  subcategories = [],
  attributeDefinitions = [],
  supabaseOn,
}: {
  products: AdminProductListItem[];
  categories: { id: string; title: string; slug?: string }[];
  subcategories?: import("@/lib/admin/queries").AdminSubcategoryRow[];
  attributeDefinitions?: import("@/lib/admin/queries").AdminAttributeDefinition[];
  supabaseOn: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [ordered, setOrdered] = useState(products);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("custom");
  const [modal, setModal] = useState<ProductModalState>(null);

  useEffect(() => {
    setOrdered(products);
  }, [products]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const categoryOptions = useMemo(
    () => Array.from(new Set(ordered.map((p) => p.category))).sort(),
    [ordered],
  );

  const filtersClear = !q.trim() && category === "all";
  const dragEnabled = supabaseOn && sort === "custom" && filtersClear && !pending;

  const filtered = useMemo(() => {
    let rows = ordered.filter((p) => {
      const hay = `${p.name} ${p.slug} ${p.category}`.toLowerCase();
      if (q && !hay.includes(q.toLowerCase())) return false;
      if (category !== "all" && p.category !== category) return false;
      return true;
    });
    rows = rows.slice().sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "stock") return a.stockQty - b.stockQty;
      if (sort === "name") return a.name.localeCompare(b.name);
      return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
    });
    return rows;
  }, [ordered, q, category, sort]);

  const { pageItems, page, setPage, totalPages, total, from, to } =
    useAdminTablePagination(filtered);

  function commitPosition(id: string, position: number) {
    const previous = ordered;
    setOrdered((rows) =>
      rows.map((row) => (row.id === id ? { ...row, sortOrder: position } : row)),
    );
    startTransition(async () => {
      const result = await setProductSortNumberAction(id, position);
      if (!result.ok) {
        setOrdered(previous);
        toast.danger(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!dragEnabled) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = filtered.findIndex((p) => p.id === active.id);
    const newIndex = filtered.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previous = ordered;
    const next = arrayMove(filtered, oldIndex, newIndex).map((product, index) => ({
      ...product,
      sortOrder: index + 1,
    }));
    setOrdered(next);
    startTransition(async () => {
      const result = await reorderProductsAction(next.map((product) => product.id));
      if (!result.ok) {
        setOrdered(previous);
        toast.danger(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchField
          value={q}
          onChange={(value) => {
            setQ(value);
            setPage(1);
          }}
          placeholder="Search products…"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
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
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className={`${fieldClassName()} max-w-48 mt-0!`}
        >
          <option value="custom">Sort: custom order</option>
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

      {sort === "custom" && !filtersClear ? (
        <p className="text-xs text-on-surface-variant">
          Clear filters to drag. The position number still moves a product in the full catalog.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-outline-variant/25 bg-white shadow-sm">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-outline-variant/20 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Variants</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="w-12 px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <SortableContext
              items={pageItems.map((product) => product.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody className="divide-y divide-outline-variant/15">
                {pageItems.map((product) => (
                  <SortableProductRow
                    key={product.id}
                    product={product}
                    dragEnabled={dragEnabled}
                    dragHint={
                      dragEnabled
                        ? "Drag to reorder"
                        : sort !== "custom"
                          ? "Switch to custom order to drag"
                          : "Clear filters to drag"
                    }
                    supabaseOn={supabaseOn}
                    pending={pending}
                    onCommitPosition={commitPosition}
                    onEdit={(id) => setModal({ mode: "edit", productId: id })}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>
      {!filtered.length ? (
        <p className="text-center text-sm text-on-surface-variant">
          No products match.
        </p>
      ) : (
        <AdminTablePagination
          page={page}
          totalPages={totalPages}
          total={total}
          from={from}
          to={to}
          onPageChange={setPage}
        />
      )}

      <ProductFormModal
        state={modal}
        categories={categories}
        subcategories={subcategories}
        attributeDefinitions={attributeDefinitions}
        supabase={supabaseOn}
        onClose={() => setModal(null)}
        onCreated={(productId) => setModal({ mode: "edit", productId })}
      />
    </div>
  );
}

function SortableProductRow({
  product,
  dragEnabled,
  dragHint,
  supabaseOn,
  pending,
  onCommitPosition,
  onEdit,
}: {
  product: AdminProductListItem;
  dragEnabled: boolean;
  dragHint: string;
  supabaseOn: boolean;
  pending: boolean;
  onCommitPosition: (id: string, position: number) => void;
  onEdit: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id, disabled: !dragEnabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-surface-container-low/50 ${isDragging ? "bg-surface-container-low opacity-70" : ""}`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="rounded-md p-1 text-on-surface-variant enabled:cursor-grab enabled:hover:bg-surface-container-high enabled:active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Drag ${product.name}`}
            title={dragHint}
            disabled={!dragEnabled}
            {...attributes}
            {...listeners}
          >
            <LuGripVertical className="h-4 w-4" aria-hidden />
          </button>
          <SortPositionInput
            product={product}
            disabled={!supabaseOn || pending}
            onCommit={onCommitPosition}
          />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-md bg-surface-container">
            <Image
              src={product.image || PRODUCT_PLACEHOLDER_IMAGE}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-on-surface">{product.name}</p>
            <p className="text-xs text-on-surface-variant">{product.slug}</p>
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
      <td className="px-4 py-3 font-semibold">
        <div className="flex flex-col">
          <span className="price text-on-surface">{formatINR(product.price)}</span>
          {product.mrp ? (
            <span className="price text-xs font-normal text-on-surface-variant line-through">
              {formatINR(product.mrp)}
            </span>
          ) : null}
        </div>
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
          onEdit={onEdit}
        />
      </td>
    </tr>
  );
}

function SortPositionInput({
  product,
  disabled,
  onCommit,
}: {
  product: AdminProductListItem;
  disabled: boolean;
  onCommit: (id: string, position: number) => void;
}) {
  const [value, setValue] = useState(String(product.sortOrder));

  useEffect(() => {
    setValue(String(product.sortOrder));
  }, [product.sortOrder]);

  function commit() {
    const next = Number(value);
    if (!Number.isFinite(next) || Math.round(next) === product.sortOrder) {
      setValue(String(product.sortOrder));
      return;
    }
    onCommit(product.id, next);
  }

  return (
    <input
      type="number"
      min={1}
      inputMode="numeric"
      aria-label={`Sort position for ${product.name}`}
      title="Position in the full catalog. Enter or leave the field to save."
      disabled={disabled}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      className="w-14 rounded-md border border-outline-variant/40 bg-white px-1.5 py-1 text-center text-xs font-semibold text-on-surface disabled:opacity-50"
    />
  );
}
