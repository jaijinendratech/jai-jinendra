"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteSubcategoryAction,
  saveSubcategoryAction,
  setSubcategoryPublishedAction,
} from "@/lib/admin/actions";
import type { AdminCategoryRow } from "@/app/admin/(dashboard)/categories/CategoriesManager";
import type { AdminSubcategoryRow } from "@/lib/admin/queries";
import {
  AdminFieldFull,
  AdminFieldGrid,
  adminFieldFullClassName,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import { AdminFormSubmitButton } from "@/components/admin/AdminIconButton";
import { AdminModal } from "@/components/admin/AdminModal";
import { SlugField } from "@/components/admin/SlugField";
import {
  AdminStatusSelect,
  PUBLISH_HIDDEN_OPTIONS,
} from "@/components/admin/AdminStatusSelect";
import { AdminActionsMenu } from "@/components/admin/AdminActionsMenu";
import {
  AdminTablePagination,
  useAdminTablePagination,
} from "@/components/admin/AdminTablePagination";
import { isNextRedirectError } from "@/lib/admin/is-redirect-error";

function SubcategoryForm({
  categories,
  subcategory,
  onSaved,
}: {
  categories: AdminCategoryRow[];
  subcategory?: AdminSubcategoryRow | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(subcategory?.title ?? "");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        setError(null);
        try {
          await saveSubcategoryAction(formData);
          router.refresh();
          onSaved?.();
        } catch (err) {
          if (isNextRedirectError(err)) throw err;
          setError(err instanceof Error ? err.message : "Could not save subcategory.");
        }
      }}
    >
      <AdminFieldGrid>
        {subcategory ? <input type="hidden" name="id" value={subcategory.id} /> : null}
        <label className={labelClassName()}>
          Parent category
          <select
            name="categoryId"
            required
            defaultValue={subcategory?.categoryId ?? categories[0]?.id ?? ""}
            className={fieldClassName()}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClassName()}>
          Title
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClassName()}
          />
        </label>
        <SlugField nameValue={title} defaultSlug={subcategory?.slug ?? ""} />
        <label className={`${labelClassName()} ${adminFieldFullClassName()}`}>
          Subtitle
          <input
            name="subtitle"
            defaultValue={subcategory?.subtitle ?? ""}
            className={fieldClassName()}
          />
        </label>
        <label className={labelClassName()}>
          Sort order
          <input
            name="sortOrder"
            type="number"
            defaultValue={subcategory?.sortOrder ?? 0}
            className={fieldClassName()}
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            name="published"
            defaultChecked={subcategory?.published ?? true}
          />
          Published
        </label>
        {error ? (
          <p className={`text-sm text-red-700 ${adminFieldFullClassName()}`} role="alert">
            {error}
          </p>
        ) : null}
        <div className={`${adminFieldFullClassName()}`}>
          <AdminFormSubmitButton
            label={subcategory ? "Save subcategory" : "Add subcategory"}
            pendingLabel="Saving…"
            icon={subcategory ? "save" : "plus"}
          />
        </div>
      </AdminFieldGrid>
    </form>
  );
}

export function SubcategoriesManager({
  categories,
  subcategories,
  supabase,
}: {
  categories: AdminCategoryRow[];
  subcategories: AdminSubcategoryRow[];
  supabase: boolean;
}) {
  const [filterCategory, setFilterCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<AdminSubcategoryRow | null>(null);

  const filtered = useMemo(() => {
    if (filterCategory === "all") return subcategories;
    return subcategories.filter((s) => s.categoryId === filterCategory);
  }, [filterCategory, subcategories]);

  const { pageItems, page, setPage, totalPages, total, from, to } =
    useAdminTablePagination(filtered);

  if (!supabase) {
    return (
      <p className="text-sm text-on-surface-variant">
        Connect Supabase to manage subcategories.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-on-surface">Subcategories</h2>
          <p className="text-sm text-on-surface-variant">
            Optional second-level taxonomy (SEV, DRYFRUIT SWEETS, etc.)
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white"
          onClick={() => {
            setEditRow(null);
            setModalOpen(true);
          }}
        >
          Add subcategory
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <span className="font-semibold">Filter by category</span>
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setPage(1);
          }}
          className={fieldClassName()}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>

      <div className="overflow-x-auto rounded-xl border border-outline-variant/20 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-outline-variant/15 bg-surface-container-low text-left text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row) => (
              <tr key={row.id} className="border-b border-outline-variant/10">
                <td className="px-4 py-3 font-semibold">{row.title}</td>
                <td className="px-4 py-3">{row.categoryTitle}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.slug}</td>
                <td className="px-4 py-3">{row.productCount}</td>
                <td className="px-4 py-3">
                  <AdminStatusSelect
                    action={setSubcategoryPublishedAction}
                    fields={{ id: row.id }}
                    name="published"
                    value={String(row.published)}
                    options={PUBLISH_HIDDEN_OPTIONS}
                    kind="publish"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminActionsMenu
                    ariaLabel="Subcategory actions"
                    items={[
                      {
                        id: "edit",
                        type: "button",
                        label: "Edit",
                        icon: "pencil",
                        onPress: () => {
                          setEditRow(row);
                          setModalOpen(true);
                        },
                      },
                      {
                        id: "delete",
                        type: "form",
                        label: "Delete",
                        icon: "trash",
                        actionKey: "deleteSubcategory",
                        fields: { id: row.id },
                        confirmMessage: "Delete this subcategory?",
                        danger: true,
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">
                  No subcategories yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <AdminTablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        from={from}
        to={to}
        onPageChange={setPage}
      />

      <AdminModal
        isOpen={modalOpen}
        onOpenChange={(next) => {
          if (!next) {
            setModalOpen(false);
            setEditRow(null);
          }
        }}
        title={editRow ? "Edit subcategory" : "Add subcategory"}
      >
        <SubcategoryForm
          key={editRow?.id ?? "new"}
          categories={categories}
          subcategory={editRow}
          onSaved={() => {
            setModalOpen(false);
            setEditRow(null);
          }}
        />
      </AdminModal>
    </div>
  );
}
