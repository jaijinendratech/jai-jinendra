import type { Metadata } from "next";
import {
  getAdminCategories,
  getIntegrationStatus,
} from "@/lib/admin/queries";
import { saveCategoryAction, setCategoryFeaturedAction, setCategoryPublishedAction } from "@/lib/admin/actions";
import {
  AdminCard,
  AdminPageHeader,
  NoticeBanner,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { CategoryRowActions } from "@/components/admin/CategoryRowActions";
import { MediaUploader } from "@/components/admin/MediaUploader";
import {
  AdminStatusSelect,
  FEATURED_OPTIONS,
  PUBLISH_HIDDEN_OPTIONS,
} from "@/components/admin/AdminStatusSelect";

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
              <th className="w-12 px-4 py-3 font-semibold" />
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
                    <CategoryRowActions id={c.id} productCount={c.productCount} />
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
            <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
              <AdminIconButton
                type="submit"
                label={editing ? "Update category" : "Create category"}
                icon={editing ? "save" : "plus"}
                variant="primary"
              />
              {editing ? (
                <AdminIconButton
                  as="link"
                  href="/admin/categories"
                  label="Cancel edit"
                  icon="x"
                  variant="secondary"
                />
              ) : null}
            </div>
          </form>
        </AdminCard>
      ) : null}
    </div>
  );
}
