import type { Metadata } from "next";
import { formatINR } from "@/lib/format";
import { getAdminCombos, getIntegrationStatus } from "@/lib/admin/queries";
import { saveComboAction, deleteComboAction } from "@/lib/admin/actions";
import {
  AdminCard,
  AdminPageHeader,
  NoticeBanner,
  fieldClassName,
  labelClassName,
  primaryBtnClassName,
} from "@/components/admin/ui";
import { ConfirmDeleteButton } from "@/components/admin/ui-client";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { LuPlus } from "react-icons/lu";

export const metadata: Metadata = {
  title: "Admin · Combos",
  robots: { index: false, follow: false },
};

export default async function AdminCombosPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const data = await getAdminCombos();
  const { supabase } = getIntegrationStatus();

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
          <AdminCard key={box.id} title={box.name}>
            <p className="text-sm text-on-surface-variant">{box.description}</p>
            <p className="price mt-3 text-sm font-bold text-primary">
              {formatINR(box.price)}
              {box.slots ? ` · ${box.slots} slots/items` : null}
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {box.published ? "Published" : "Draft"}
              {box.featured ? " · Featured" : ""}
            </p>
            {supabase && data.source === "supabase" ? (
              <div className="mt-3">
                <ConfirmDeleteButton action={deleteComboAction} label="Delete combo">
                  <input type="hidden" name="id" value={box.id} />
                </ConfirmDeleteButton>
              </div>
            ) : null}
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
        <AdminCard title="Add combo">
          <form action={saveComboAction} className="grid gap-3 sm:grid-cols-2">
            <label className={labelClassName()}>
              Name
              <input name="name" required className={fieldClassName()} />
            </label>
            <label className={labelClassName()}>
              Slug
              <input name="slug" required className={fieldClassName()} />
            </label>
            <label className={`${labelClassName()} sm:col-span-2`}>
              Description
              <textarea name="description" rows={2} className={fieldClassName()} />
            </label>
            <label className={labelClassName()}>
              Price (INR)
              <input name="price" type="number" step="0.01" required className={fieldClassName()} />
            </label>
            <label className={labelClassName()}>
              MRP (INR)
              <input name="mrp" type="number" step="0.01" className={fieldClassName()} />
            </label>
            <label className={labelClassName()}>
              SKU
              <input name="sku" className={fieldClassName()} />
            </label>
            <div className={labelClassName()}>
              <MediaUploader
                name="imageUrl"
                folder="combos"
                label="Combo image"
                disabled={!supabase}
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" name="published" defaultChecked />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" name="featured" />
              Featured
            </label>
            <button type="submit" className={`${primaryBtnClassName()} inline-flex items-center gap-2 sm:col-span-2`}>
              <LuPlus className="h-4 w-4" />
              Save combo
            </button>
          </form>
        </AdminCard>
      ) : null}
    </div>
  );
}
