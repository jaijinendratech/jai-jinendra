import type { Metadata } from "next";
import { formatINR } from "@/lib/format";
import { getAdminCombos, getIntegrationStatus } from "@/lib/admin/queries";
import { saveComboAction, setComboFeaturedAction, setComboPublishedAction } from "@/lib/admin/actions";
import {
  AdminCard,
  AdminPageHeader,
  NoticeBanner,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { ComboCardActions } from "@/components/admin/ComboCardActions";
import { MediaUploader } from "@/components/admin/MediaUploader";
import {
  AdminStatusSelect,
  FEATURED_OPTIONS,
  PUBLISH_HIDDEN_OPTIONS,
} from "@/components/admin/AdminStatusSelect";

export const metadata: Metadata = {
  title: "Admin · Combos",
  robots: { index: false, follow: false },
};

export default async function AdminCombosPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; edit?: string }>;
}) {
  const { notice, edit } = await searchParams;
  const data = await getAdminCombos();
  const { supabase } = getIntegrationStatus();
  const editing = edit ? data.boxes.find((b) => b.id === edit) : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Combos"
        description={
          data.source === "supabase"
            ? "Managed in combos / combo_items tables."
            : "Static combo-builder config (fallback when Supabase is off)."
        }
      />
      <NoticeBanner notice={notice} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.boxes.map((box) => (
          <AdminCard
            key={box.id}
            title={box.name}
            action={
              supabase && data.source === "supabase" ? (
                <ComboCardActions id={box.id} />
              ) : null
            }
          >
            <p className="text-sm text-on-surface-variant">{box.description}</p>
            <p className="price mt-3 text-sm font-bold text-primary">
              {formatINR(box.price)}
              {box.slots ? ` · ${box.slots} slots/items` : null}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-1.5">
              {supabase && data.source === "supabase" ? (
                <>
                  <AdminStatusSelect
                    action={setComboPublishedAction}
                    fields={{ id: box.id }}
                    name="published"
                    value={String(box.published)}
                    options={PUBLISH_HIDDEN_OPTIONS}
                    kind="publish"
                  />
                  <AdminStatusSelect
                    action={setComboFeaturedAction}
                    fields={{ id: box.id }}
                    name="featured"
                    value={String(box.featured)}
                    options={FEATURED_OPTIONS}
                    kind="featured"
                  />
                </>
              ) : (
                <span className="text-xs text-on-surface-variant">
                  {box.published ? "Published" : "Hidden"}
                  {box.featured ? " · Featured" : ""}
                </span>
              )}
            </p>
          </AdminCard>
        ))}
      </div>

      {data.pool.length ? (
        <AdminCard title="Builder pool (static)">
          <ul className="divide-y divide-outline-variant/15">
            {data.pool.map((p) => (
              <li key={p.id} className="flex justify-between py-3 text-sm">
                <span className="font-semibold">{p.name}</span>
                <span className="price font-semibold">{formatINR(p.price)}</span>
              </li>
            ))}
          </ul>
        </AdminCard>
      ) : null}

      {supabase ? (
        <AdminCard title={editing ? `Edit · ${editing.name}` : "Add combo"}>
          <form action={saveComboAction} className="grid gap-3 sm:grid-cols-2">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <label className={labelClassName()}>
              Name
              <input
                name="name"
                required
                defaultValue={editing?.name ?? ""}
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
              Description
              <textarea
                name="description"
                rows={2}
                defaultValue={editing?.description ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className={labelClassName()}>
              Price (INR)
              <input
                name="price"
                type="number"
                step="0.01"
                required
                defaultValue={editing?.price ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className={labelClassName()}>
              MRP (INR)
              <input
                name="mrp"
                type="number"
                step="0.01"
                defaultValue={editing?.mrp ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className={labelClassName()}>
              SKU
              <input
                name="sku"
                defaultValue={editing?.sku ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className={labelClassName()}>
              Sort order
              <input
                name="sortOrder"
                type="number"
                defaultValue={editing?.sortOrder ?? 0}
                className={fieldClassName()}
              />
            </label>
            <div className={`${labelClassName()} sm:col-span-2`}>
              <MediaUploader
                name="imageUrl"
                folder="combos"
                label="Combo image"
                defaultItems={
                  editing?.imageUrl
                    ? [{ path: editing.imageUrl, url: editing.imageUrl }]
                    : []
                }
                disabled={!supabase}
              />
            </div>
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
            <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
              <AdminIconButton
                type="submit"
                label={editing ? "Update combo" : "Save combo"}
                icon={editing ? "save" : "plus"}
                variant="primary"
              />
              {editing ? (
                <AdminIconButton
                  as="link"
                  href="/admin/combos"
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
