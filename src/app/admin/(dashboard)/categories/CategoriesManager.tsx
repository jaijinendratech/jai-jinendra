"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveCategoryAction,
  setCategoryFeaturedAction,
  setCategoryPublishedAction,
} from "@/lib/admin/actions";
import {
  AdminFieldFull,
  AdminFieldGrid,
  adminFieldFullClassName,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import {
  AdminFormSubmitButton,
  AdminIconButton,
} from "@/components/admin/AdminIconButton";
import { CategoryRowActions } from "@/components/admin/CategoryRowActions";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  AdminStatusSelect,
  FEATURED_OPTIONS,
  PUBLISH_HIDDEN_OPTIONS,
} from "@/components/admin/AdminStatusSelect";
import {
  AdminTablePagination,
  useAdminTablePagination,
} from "@/components/admin/AdminTablePagination";
import { isNextRedirectError } from "@/lib/admin/is-redirect-error";

export type AdminCategoryRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  sortOrder: number;
  published: boolean;
  featured: boolean;
  productCount: number;
};

function CategoryFormFields({
  category,
  onSaved,
}: {
  category?: AdminCategoryRow | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        setError(null);
        try {
          await saveCategoryAction(formData);
          router.refresh();
          onSaved?.();
        } catch (err) {
          if (isNextRedirectError(err)) throw err;
          setError(
            err instanceof Error ? err.message : "Could not save category.",
          );
        }
      }}
    >
      <AdminFieldGrid>
        {category ? <input type="hidden" name="id" value={category.id} /> : null}
        <label className={`${labelClassName()} ${adminFieldFullClassName()}`}>
          Title
          <input
            name="title"
            required
            defaultValue={category?.title ?? ""}
            className={fieldClassName()}
          />
        </label>
        <label className={`${labelClassName()} ${adminFieldFullClassName()}`}>
          Subtitle
          <input
            name="subtitle"
            defaultValue={category?.subtitle ?? ""}
            className={fieldClassName()}
          />
        </label>
        <AdminFieldFull>
          <div className={labelClassName()}>
            <MediaUploader
              name="imageUrl"
              folder="categories"
              label="Category image"
              defaultItems={
                category?.imageUrl
                  ? [{ path: category.imageUrl, url: category.imageUrl }]
                  : []
              }
            />
          </div>
        </AdminFieldFull>
        <label className={labelClassName()}>
          Sort order
          <input
            name="sortOrder"
            type="number"
            defaultValue={category?.sortOrder ?? 0}
            className={fieldClassName()}
          />
        </label>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              name="published"
              defaultChecked={category?.published ?? true}
            />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={category?.featured ?? false}
            />
            Featured
          </label>
        </div>
        {error ? (
          <p className={`text-sm text-red-700 ${adminFieldFullClassName()}`} role="alert">
            {error}
          </p>
        ) : null}
        <div className={`flex flex-wrap items-center gap-2 ${adminFieldFullClassName()}`}>
          <AdminFormSubmitButton
            label={category ? "Save category" : "Add category"}
            pendingLabel={category ? "Saving…" : "Creating…"}
            icon={category ? "save" : "plus"}
          />
        </div>
      </AdminFieldGrid>
    </form>
  );
}

export function CategoriesManager({
  categories,
  supabase,
}: {
  categories: AdminCategoryRow[];
  supabase: boolean;
}) {
  const [modal, setModal] = useState<"create" | string | null>(null);
  const editing =
    modal && modal !== "create"
      ? (categories.find((c) => c.id === modal) ?? null)
      : null;
  const isOpen = modal !== null;
  const { pageItems, page, setPage, totalPages, total, from, to } =
    useAdminTablePagination(categories);

  return (
    <>
      {supabase ? (
        <div className="flex justify-end">
          <AdminIconButton
            label="Add category"
            icon="plus"
            variant="primary"
            showLabel
            onClick={() => setModal("create")}
          />
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-outline-variant/25 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-outline-variant/20 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Products</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="w-12 px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {pageItems.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-xs text-on-surface-variant">{c.subtitle}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3">{c.productCount}</td>
                <td className="px-4 py-3">
                  {supabase ? (
                    <div className="flex flex-wrap gap-1.5">
                      <AdminStatusSelect
                        action={setCategoryPublishedAction}
                        fields={{ id: c.id }}
                        name="published"
                        value={String(c.published)}
                        options={PUBLISH_HIDDEN_OPTIONS}
                        kind="publish"
                      />
                      <AdminStatusSelect
                        action={setCategoryFeaturedAction}
                        fields={{ id: c.id }}
                        name="featured"
                        value={String(c.featured)}
                        options={FEATURED_OPTIONS}
                        kind="featured"
                      />
                    </div>
                  ) : (
                    <span className="text-xs font-semibold">
                      {c.published ? "Published" : "Hidden"}
                      {c.featured ? " · Featured" : ""}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {supabase ? (
                    <CategoryRowActions
                      id={c.id}
                      productCount={c.productCount}
                      onEdit={(id) => setModal(id)}
                    />
                  ) : (
                    <span className="text-xs text-on-surface-variant">
                      View only
                    </span>
                  )}
                </td>
              </tr>
            ))}
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
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
        title={
          modal === "create"
            ? "Add category"
            : editing
              ? `Edit · ${editing.title}`
              : "Edit category"
        }
        size="lg"
      >
        {modal === "create" ? (
          <CategoryFormFields key="create" onSaved={() => setModal(null)} />
        ) : editing ? (
          <CategoryFormFields
            key={editing.id}
            category={editing}
            onSaved={() => setModal(null)}
          />
        ) : null}
      </AdminModal>
    </>
  );
}
