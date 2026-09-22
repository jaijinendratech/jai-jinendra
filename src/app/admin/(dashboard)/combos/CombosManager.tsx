"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/format";
import {
  saveComboAction,
  setComboFeaturedAction,
  setComboPublishedAction,
} from "@/lib/admin/actions";
import {
  AdminCard,
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
import { ComboCardActions } from "@/components/admin/ComboCardActions";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { AdminModal } from "@/components/admin/AdminModal";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  AdminStatusSelect,
  FEATURED_OPTIONS,
  PUBLISH_HIDDEN_OPTIONS,
} from "@/components/admin/AdminStatusSelect";
import { SafeHtml } from "@/components/shared/SafeHtml";
import { isNextRedirectError } from "@/lib/admin/is-redirect-error";

export type AdminComboBox = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  mrp: number | null;
  sku: string;
  sortOrder: number;
  slots?: number;
  published: boolean;
  featured: boolean;
  imageUrl: string | null;
};

function ComboFormFields({
  combo,
  onSaved,
}: {
  combo?: AdminComboBox | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        setError(null);
        try {
          await saveComboAction(formData);
          router.refresh();
          onSaved?.();
        } catch (err) {
          if (isNextRedirectError(err)) throw err;
          setError(
            err instanceof Error ? err.message : "Could not save combo.",
          );
        }
      }}
    >
      <AdminFieldGrid>
        {combo ? <input type="hidden" name="id" value={combo.id} /> : null}
        <label className={`${labelClassName()} ${adminFieldFullClassName()}`}>
          Name
          <input
            name="name"
            required
            defaultValue={combo?.name ?? ""}
            className={fieldClassName()}
          />
        </label>
        <AdminFieldFull>
          <RichTextEditor
            name="description"
            label="Description"
            defaultValue={combo?.description ?? ""}
            placeholder="Describe this combo…"
          />
        </AdminFieldFull>
        <label className={labelClassName()}>
          Price (INR)
          <input
            name="price"
            type="number"
            step="0.01"
            required
            defaultValue={combo?.price ?? ""}
            className={fieldClassName()}
          />
        </label>
        <label className={labelClassName()}>
          MRP (INR)
          <input
            name="mrp"
            type="number"
            step="0.01"
            defaultValue={combo?.mrp ?? ""}
            className={fieldClassName()}
          />
        </label>
        <AdminFieldFull>
          <div className={labelClassName()}>
            <MediaUploader
              name="imageUrl"
              folder="combos"
              label="Combo image"
              defaultItems={
                combo?.imageUrl
                  ? [{ path: combo.imageUrl, url: combo.imageUrl }]
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
            defaultValue={combo?.sortOrder ?? 0}
            className={fieldClassName()}
          />
        </label>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              name="published"
              defaultChecked={combo?.published ?? true}
            />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={combo?.featured ?? false}
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
            label={combo ? "Save combo" : "Add combo"}
            pendingLabel={combo ? "Saving…" : "Creating…"}
            icon={combo ? "save" : "plus"}
          />
        </div>
      </AdminFieldGrid>
    </form>
  );
}

export function CombosManager({
  boxes,
  pool,
  source,
  supabase,
}: {
  boxes: AdminComboBox[];
  pool: { id: string; name: string; price: number }[];
  source: "supabase" | "static";
  supabase: boolean;
}) {
  const [modal, setModal] = useState<"create" | string | null>(null);
  const editing =
    modal && modal !== "create"
      ? (boxes.find((b) => b.id === modal) ?? null)
      : null;
  const isOpen = modal !== null;
  const canManage = supabase && source === "supabase";

  return (
    <>
      {supabase ? (
        <div className="flex justify-end">
          <AdminIconButton
            label="Add combo"
            icon="plus"
            variant="primary"
            showLabel
            onClick={() => setModal("create")}
          />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {boxes.map((box) => (
          <AdminCard
            key={box.id}
            title={box.name}
            action={
              canManage ? (
                <ComboCardActions id={box.id} onEdit={(id) => setModal(id)} />
              ) : null
            }
          >
            <SafeHtml
              html={box.description ?? ""}
              className="text-sm text-on-surface-variant"
            />
            <p className="price mt-3 text-sm font-bold text-primary">
              {formatINR(box.price)}
              {box.slots ? ` · ${box.slots} slots/items` : null}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-1.5">
              {canManage ? (
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

      {pool.length ? (
        <AdminCard title="Builder pool (static)">
          <ul className="divide-y divide-outline-variant/15">
            {pool.map((p) => (
              <li key={p.id} className="flex justify-between py-3 text-sm">
                <span className="font-semibold">{p.name}</span>
                <span className="price font-semibold">{formatINR(p.price)}</span>
              </li>
            ))}
          </ul>
        </AdminCard>
      ) : null}

      <AdminModal
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
        title={
          modal === "create"
            ? "Add combo"
            : editing
              ? `Edit · ${editing.name}`
              : "Edit combo"
        }
        size="lg"
      >
        {modal === "create" ? (
          <ComboFormFields key="create" onSaved={() => setModal(null)} />
        ) : editing ? (
          <ComboFormFields
            key={editing.id}
            combo={editing}
            onSaved={() => setModal(null)}
          />
        ) : null}
      </AdminModal>
    </>
  );
}
