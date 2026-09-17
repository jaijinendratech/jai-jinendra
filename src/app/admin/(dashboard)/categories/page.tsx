import type { Metadata } from "next";
import {
  getAdminCategories,
  getIntegrationStatus,
} from "@/lib/admin/queries";
import {
  saveCategoryAction,
  deleteCategoryAction,
} from "@/lib/admin/actions";
import {
  AdminCard,
  AdminPageHeader,
  NoticeBanner,
  fieldClassName,
  labelClassName,
  primaryBtnClassName,
  secondaryBtnClassName,
} from "@/components/admin/ui";
import { ConfirmDeleteButton } from "@/components/admin/ui-client";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";

export const metadata: Metadata = {
  title: "Admin · Categories",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string; edit?: string }>;
}) {
  const { notice, error, edit } = await searchParams;
  const categories = await getAdminCategories();
  const { supabase } = getIntegrationStatus();
  const editing = edit ? categories.find((c) => c.id === edit) : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description={
          supabase
            ? "CRUD against Supabase categories."
            : "Catalogue tiles (static) — connect Supabase to create/edit."
        }
      />
      <NoticeBanner notice={notice} error={error} />

      <div className="overflow-x-auto rounded-xl border border-outline-variant/25 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-outline-variant/20 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Products</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-xs text-on-surface-variant">{c.subtitle}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3">{c.productCount}</td>
                <td className="px-4 py-3 text-xs font-semibold">
                  {c.published ? "Published" : "Draft"}
                  {c.featured ? " · Featured" : ""}
                </td>
                <td className="px-4 py-3">
                  {supabase ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={`/admin/categories?edit=${c.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                      >
                        <LuPencil className="h-3.5 w-3.5" />
                        Edit
                      </a>
                      <ConfirmDeleteButton
                        action={deleteCategoryAction}
                        label="Delete"
                        confirmMessage={
                          c.productCount > 0
                            ? "This category has linked products and cannot be deleted safely."
                            : "Delete this category?"
                        }
                      >
                        <input type="hidden" name="id" value={c.id} />
                      </ConfirmDeleteButton>
                    </div>
                  ) : (
                    <span className="text-xs text-on-surface-variant">View only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {supabase ? (
        <AdminCard title={editing ? `Edit · ${editing.title}` : "Add category"}>
          <form action={saveCategoryAction} className="grid gap-3 sm:grid-cols-2">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <label className={labelClassName()}>
              Title
              <input
                name="title"
                required
                defaultValue={editing?.title ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className={labelClassName()}>
              Slug
              <input
                name="slug"
                required
                defaultValue={editing?.slug ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className={`${labelClassName()} sm:col-span-2`}>
              Subtitle
              <input
                name="subtitle"
                defaultValue={editing?.subtitle ?? ""}
                className={fieldClassName()}
              />
            </label>
            <div className={`${labelClassName()} sm:col-span-2`}>
              <MediaUploader
                name="imageUrl"
                folder="categories"
                label="Category image"
                defaultItems={
                  editing?.imageUrl
                    ? [{ path: editing.imageUrl, url: editing.imageUrl }]
                    : []
                }
                disabled={!supabase}
              />
            </div>
            <label className={labelClassName()}>
              Sort order
              <input
                name="sortOrder"
                type="number"
                defaultValue={editing?.sortOrder ?? 0}
                className={fieldClassName()}
              />
            </label>
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={editing?.published ?? true}
                />
                Published
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={editing?.featured ?? false}
                />
                Featured
              </label>
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button type="submit" className={`${primaryBtnClassName()} inline-flex items-center gap-2`}>
                <LuPlus className="h-4 w-4" />
                {editing ? "Update category" : "Create category"}
              </button>
              {editing ? (
                <a href="/admin/categories" className={secondaryBtnClassName()}>
                  Cancel edit
                </a>
              ) : null}
            </div>
          </form>
        </AdminCard>
      ) : null}
    </div>
  );
}
