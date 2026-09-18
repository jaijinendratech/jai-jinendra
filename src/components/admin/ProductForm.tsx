"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminProductDetail } from "@/lib/admin/queries";
import {
  saveProductAction,
  saveVariantAction,
  saveProductImageAction,
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
import { AdminActionsMenu } from "@/components/admin/AdminActionsMenu";
import { ChipInput } from "@/components/admin/ChipInput";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { suggestTagline } from "@/lib/admin/slug";
import { isNextRedirectError } from "@/lib/admin/is-redirect-error";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";

type CategoryOption = { id: string; title: string };

export function ProductForm({
  product,
  categories,
  supabase,
  layout = "page",
  onCreated,
  onModalRefresh,
}: {
  product: AdminProductDetail | null;
  categories: CategoryOption[];
  supabase: boolean;
  /** `modal` hides page chrome (back link / outer title) for use inside AdminModal. */
  layout?: "page" | "modal";
  /** Called after a successful create in modal layout (auto-open Edit). */
  onCreated?: (productId: string) => void;
  /** Reload modal product detail after variant/image/save updates. */
  onModalRefresh?: () => void;
}) {
  const router = useRouter();
  const isNew = !product;
  const isModal = layout === "modal";
  const [name, setName] = useState(product?.name ?? "");
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [taglineTouched, setTaglineTouched] = useState(Boolean(product?.tagline));
  const [tab, setTab] = useState<"details" | "variants" | "images">("details");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!taglineTouched) setTagline(suggestTagline(name));
  }, [name, taglineTouched]);

  async function handleSaveProduct(formData: FormData) {
    setFormError(null);
    try {
      const result = await saveProductAction(formData);
      if (result && "productId" in result && result.productId) {
        router.refresh();
        if (result.created && onCreated) {
          onCreated(result.productId);
          return;
        }
        onModalRefresh?.();
      }
    } catch (error) {
      if (isNextRedirectError(error)) throw error;
      setFormError(
        error instanceof Error ? error.message : "Could not save product.",
      );
    }
  }

  async function handleNestedAction(
    action: (formData: FormData) => Promise<void>,
    formData: FormData,
  ) {
    setFormError(null);
    try {
      await action(formData);
      router.refresh();
      onModalRefresh?.();
    } catch (error) {
      if (isNextRedirectError(error)) throw error;
      setFormError(
        error instanceof Error ? error.message : "Could not save changes.",
      );
    }
  }

  return (
    <div className={cn(isModal ? "space-y-4" : "mx-auto max-w-4xl space-y-6")}>
      {!isModal ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              {isNew ? "Add product" : "Edit product"}
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              {supabase
                ? isNew
                  ? "Create the product first, then add variants and images."
                  : "Changes save to Supabase."
                : "Form preview — connect Supabase to persist."}
            </p>
          </div>
          <AdminIconButton
            as="link"
            href="/admin/products"
            label="Back to products"
            icon="arrow-left"
            variant="secondary"
            showLabel
          />
        </div>
      ) : null}

      {formError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b border-outline-variant/25 pb-2">
        {(
          [
            { id: "details" as const, label: "Details", locked: false },
            { id: "variants" as const, label: "Variants", locked: isNew },
            { id: "images" as const, label: "Images", locked: isNew },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={t.locked}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-primary text-white"
                : t.locked
                  ? "cursor-not-allowed text-outline"
                  : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {t.label}
            {t.locked ? " (save first)" : ""}
          </button>
        ))}
      </div>

      {tab === "details" ? (
        <form
          action={
            isModal
              ? handleSaveProduct
              : async (formData) => {
                  await saveProductAction(formData);
                }
          }
          className="space-y-6"
        >
          {product ? <input type="hidden" name="id" value={product.id} /> : null}
          {isModal ? <input type="hidden" name="returnTo" value="modal" /> : null}

          <AdminCard title="Basic information">
            <AdminFieldGrid>
              <label className={labelClassName()}>
                Name
                <input
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={fieldClassName()}
                />
              </label>
              <label className={labelClassName()}>
                Category
                <select
                  name="categoryId"
                  defaultValue={product?.categoryId ?? ""}
                  className={fieldClassName()}
                >
                  <option value="">— Select —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <ChipInput
                  name="badge"
                  label="Badge"
                  mode="single"
                  defaultValue={product?.badge ? [product.badge] : []}
                  placeholder="e.g. Bestseller — press Enter"
                />
              </div>
              <label className={labelClassName()}>
                Tagline
                <input
                  name="tagline"
                  value={tagline}
                  onChange={(e) => {
                    setTaglineTouched(true);
                    setTagline(e.target.value);
                  }}
                  className={fieldClassName()}
                />
                <span className="mt-1 block text-[11px] font-normal text-on-surface-variant">
                  Auto-suggested from name — edit anytime
                </span>
              </label>
              <AdminFieldFull>
                <RichTextEditor
                  name="description"
                  label="Short description"
                  defaultValue={product?.description ?? ""}
                  placeholder="Short product summary…"
                />
              </AdminFieldFull>
              <AdminFieldFull>
                <RichTextEditor
                  name="longDescription"
                  label="Long description"
                  defaultValue={product?.longDescription ?? ""}
                  placeholder="Full story, bullets, highlights…"
                />
              </AdminFieldFull>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" name="published" defaultChecked={product?.published ?? true} />
                Published
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" name="bestseller" defaultChecked={product?.bestseller ?? false} />
                Bestseller
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" name="newArrival" defaultChecked={product?.newArrival ?? false} />
                New arrival
              </label>
            </AdminFieldGrid>
          </AdminCard>

          <AdminCard title="Food attributes">
            <AdminFieldGrid>
              <label className={labelClassName()}>
                Spice note
                <input name="spiceNote" defaultValue={product?.spiceNote ?? ""} className={fieldClassName()} />
              </label>
              <label className={labelClassName()}>
                Origin
                <input name="origin" defaultValue={product?.origin ?? ""} className={fieldClassName()} />
              </label>
              <label className={`${labelClassName()} ${adminFieldFullClassName()}`}>
                Shelf life
                <input name="shelfLife" defaultValue={product?.shelfLife ?? ""} className={fieldClassName()} />
              </label>
              <AdminFieldFull>
                <ChipInput
                  name="dietary"
                  label="Dietary tags"
                  mode="multi"
                  defaultValue={product?.dietary ?? []}
                  placeholder="e.g. Jain — press Enter"
                />
              </AdminFieldFull>
              <AdminFieldFull>
                <ChipInput
                  name="ingredients"
                  label="Ingredients"
                  mode="multi"
                  defaultValue={product?.ingredients ?? []}
                  placeholder="Add ingredient — press Enter"
                />
              </AdminFieldFull>
            </AdminFieldGrid>
          </AdminCard>

          <div className="flex flex-wrap gap-3">
            <AdminFormSubmitButton
              label={isNew ? "Add product" : "Save product"}
              pendingLabel={isNew ? "Creating…" : "Saving…"}
              icon={isNew ? "plus" : "save"}
              disabled={!supabase && isNew}
            />
          </div>
        </form>
      ) : null}

      {tab === "variants" && product ? (
        <AdminCard title="Variants / commerce">
          <ul className="mb-6 divide-y divide-outline-variant/15">
            {product.variants.map((v) => (
              <li
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{v.label}</p>
                  <p className="text-xs text-on-surface-variant">
                    {v.sku} · {formatINR(v.pricePaise / 100)} · stock {v.stockQty}
                    {!v.available ? " · unavailable" : ""}
                  </p>
                </div>
                {supabase ? (
                  <AdminActionsMenu
                    ariaLabel="Variant actions"
                    items={[
                      {
                        id: "remove",
                        type: "form",
                        label: "Remove variant",
                        icon: "trash",
                        actionKey: "deleteVariant",
                        fields: { id: v.id, productId: product.id },
                        confirmMessage: "Remove this variant?",
                        danger: true,
                      },
                    ]}
                  />
                ) : null}
              </li>
            ))}
            {!product.variants.length ? (
              <li className="py-4 text-sm text-on-surface-variant">No variants yet.</li>
            ) : null}
          </ul>

          {supabase ? (
            <form
              action={(fd) => handleNestedAction(saveVariantAction, fd)}
              className="grid gap-3 rounded-lg border border-outline-variant/20 bg-surface-container-low p-4 sm:grid-cols-3"
            >
              <input type="hidden" name="productId" value={product.id} />
              <label className={labelClassName()}>
                Label
                <input name="label" required className={fieldClassName()} placeholder="400g" />
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
                Stock
                <input name="stockQty" type="number" defaultValue={0} className={fieldClassName()} />
              </label>
              <label className={labelClassName()}>
                Low-stock threshold
                <input name="lowStockThreshold" type="number" defaultValue={5} className={fieldClassName()} />
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-3">
                <input type="checkbox" name="available" defaultChecked />
                Available for sale
              </label>
              <AdminFormSubmitButton label="Add variant" pendingLabel="Adding…" icon="plus" />
            </form>
          ) : (
            <p className="text-sm text-on-surface-variant">Connect Supabase to manage variants.</p>
          )}
        </AdminCard>
      ) : null}

      {tab === "images" && product ? (
        <AdminCard title="Product images">
          <ul className="mb-4 grid gap-2 sm:grid-cols-2">
            {product.images.map((img, index) => (
              <li
                key={img.id}
                className="flex items-center gap-3 rounded-lg border border-outline-variant/20 p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.storagePath}
                  alt={img.alt ?? ""}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">
                    {img.alt || `Image ${index + 1}`}
                  </p>
                  {index === 0 ? (
                    <p className="text-[10px] font-semibold text-primary">Primary</p>
                  ) : null}
                </div>
                {supabase ? (
                  <AdminActionsMenu
                    ariaLabel="Image actions"
                    items={[
                      {
                        id: "remove",
                        type: "form",
                        label: "Remove image",
                        icon: "trash",
                        actionKey: "deleteProductImage",
                        fields: { id: img.id, productId: product.id },
                        confirmMessage: "Remove this image?",
                        danger: true,
                      },
                    ]}
                  />
                ) : null}
              </li>
            ))}
            {!product.images.length ? (
              <li className="col-span-full py-4 text-sm text-on-surface-variant">
                No images yet — upload below.
              </li>
            ) : null}
          </ul>

          {supabase ? (
            <form
              action={(fd) => handleNestedAction(saveProductImageAction, fd)}
              className="space-y-3"
            >
              <input type="hidden" name="productId" value={product.id} />
              <MediaUploader name="storagePath" folder="products" label="Upload image" />
              <label className={labelClassName()}>
                Alt text
                <input name="alt" className={fieldClassName()} />
              </label>
              <input type="hidden" name="sortOrder" value={product.images.length} />
              <AdminFormSubmitButton label="Attach image" pendingLabel="Attaching…" icon="plus" />
            </form>
          ) : (
            <p className="text-sm text-on-surface-variant">Connect Supabase to upload images.</p>
          )}
        </AdminCard>
      ) : null}
    </div>
  );
}
