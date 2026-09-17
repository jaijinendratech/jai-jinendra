"use client";

import { useEffect, useState } from "react";
import type { AdminProductDetail } from "@/lib/admin/queries";
import {
  saveProductAction,
  saveVariantAction,
  deleteVariantAction,
  saveProductImageAction,
  deleteProductImageAction,
} from "@/lib/admin/actions";
import {
  AdminCard,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { AdminActionsMenu } from "@/components/admin/AdminActionsMenu";
import { SlugField } from "@/components/admin/SlugField";
import { ChipInput } from "@/components/admin/ChipInput";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { suggestTagline } from "@/lib/admin/slug";
import { formatINR } from "@/lib/format";

type CategoryOption = { id: string; title: string };

export function ProductForm({
  product,
  categories,
  supabase,
}: {
  product: AdminProductDetail | null;
  categories: CategoryOption[];
  supabase: boolean;
}) {
  const isNew = !product;
  const [name, setName] = useState(product?.name ?? "");
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [taglineTouched, setTaglineTouched] = useState(Boolean(product?.tagline));
  const [tab, setTab] = useState<"details" | "variants" | "images">("details");

  useEffect(() => {
    if (!taglineTouched) setTagline(suggestTagline(name));
  }, [name, taglineTouched]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
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
        />
      </div>

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
        <form action={saveProductAction} className="space-y-6">
          {product ? <input type="hidden" name="id" value={product.id} /> : null}

          <AdminCard title="Basic information">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={`${labelClassName()} sm:col-span-2`}>
                Name
                <input
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={fieldClassName()}
                />
              </label>
              <SlugField nameValue={name} defaultSlug={product?.slug ?? ""} />
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
              <div className="sm:col-span-2">
                <ChipInput
                  name="badge"
                  label="Badge"
                  mode="single"
                  defaultValue={product?.badge ? [product.badge] : []}
                  placeholder="e.g. Bestseller — press Enter"
                />
              </div>
              <label className={`${labelClassName()} sm:col-span-2`}>
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
              <div className="sm:col-span-2">
                <RichTextEditor
                  name="description"
                  label="Short description"
                  defaultValue={product?.description ?? ""}
                  placeholder="Short product summary…"
                />
              </div>
              <div className="sm:col-span-2">
                <RichTextEditor
                  name="longDescription"
                  label="Long description"
                  defaultValue={product?.longDescription ?? ""}
                  placeholder="Full story, bullets, highlights…"
                />
              </div>
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
            </div>
          </AdminCard>

          <AdminCard title="Food attributes">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClassName()}>
                Spice note
                <input name="spiceNote" defaultValue={product?.spiceNote ?? ""} className={fieldClassName()} />
              </label>
              <label className={labelClassName()}>
                Origin
                <input name="origin" defaultValue={product?.origin ?? ""} className={fieldClassName()} />
              </label>
              <label className={labelClassName()}>
                Shelf life
                <input name="shelfLife" defaultValue={product?.shelfLife ?? ""} className={fieldClassName()} />
              </label>
              <div className="sm:col-span-2">
                <ChipInput
                  name="dietary"
                  label="Dietary tags"
                  mode="multi"
                  defaultValue={product?.dietary ?? []}
                  placeholder="e.g. Jain — press Enter"
                />
              </div>
              <div className="sm:col-span-2">
                <ChipInput
                  name="ingredients"
                  label="Ingredients"
                  mode="multi"
                  defaultValue={product?.ingredients ?? []}
                  placeholder="Add ingredient — press Enter"
                />
              </div>
            </div>
          </AdminCard>

          <div className="flex flex-wrap gap-3">
            <AdminIconButton
              type="submit"
              label={isNew ? "Create product" : "Save changes"}
              icon="save"
              variant="primary"
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
                        action: deleteVariantAction,
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
              action={saveVariantAction}
              className="grid gap-3 rounded-lg border border-outline-variant/20 bg-surface-container-low p-4 sm:grid-cols-3"
            >
              <input type="hidden" name="productId" value={product.id} />
              <label className={labelClassName()}>
                Label
                <input name="label" required className={fieldClassName()} placeholder="400g" />
              </label>
              <label className={labelClassName()}>
                SKU
                <input name="sku" required className={fieldClassName()} />
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
              <AdminIconButton
                type="submit"
                label="Add variant"
                icon="plus"
                variant="primary"
              />
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
                        action: deleteProductImageAction,
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
            <form action={saveProductImageAction} className="space-y-3">
              <input type="hidden" name="productId" value={product.id} />
              <MediaUploader name="storagePath" folder="products" label="Upload image" />
              <label className={labelClassName()}>
                Alt text
                <input name="alt" className={fieldClassName()} />
              </label>
              <input type="hidden" name="sortOrder" value={product.images.length} />
              <AdminIconButton
                type="submit"
                label="Attach image"
                icon="plus"
                variant="primary"
              />
            </form>
          ) : (
            <p className="text-sm text-on-surface-variant">Connect Supabase to upload images.</p>
          )}
        </AdminCard>
      ) : null}
    </div>
  );
}
