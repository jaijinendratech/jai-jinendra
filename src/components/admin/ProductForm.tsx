"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminProductDetail } from "@/lib/admin/queries";
import type { AdminSubcategoryRow } from "@/lib/admin/queries";
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
import { SlugField } from "@/components/admin/SlugField";
import { suggestTagline } from "@/lib/admin/slug";
import { variantPresetsForCategory } from "@/lib/catalog/variant-presets";
import { isNextRedirectError } from "@/lib/admin/is-redirect-error";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { SellingUnit } from "@/types/catalog";

type CategoryOption = { id: string; title: string; slug?: string };

const SELLING_UNITS: SellingUnit[] = ["g", "kg", "pack", "pc", "other"];

function VariantEditor({
  productId,
  variant,
  onSaved,
  onCancel,
}: {
  productId: string;
  variant?: AdminProductDetail["variants"][number];
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(variant);

  return (
    <form
      action={async (fd) => {
        try {
          await saveVariantAction(fd);
          router.refresh();
          onSaved();
        } catch (error) {
          if (isNextRedirectError(error)) throw error;
          throw error;
        }
      }}
      className="grid gap-3 rounded-lg border border-primary/20 bg-white p-4 sm:grid-cols-3"
    >
      {variant ? <input type="hidden" name="id" value={variant.id} /> : null}
      <input type="hidden" name="productId" value={productId} />
      <label className={labelClassName()}>
        Label
        <input
          name="label"
          required
          defaultValue={variant?.label ?? ""}
          className={fieldClassName()}
        />
      </label>
      <label className={labelClassName()}>
        Selling unit
        <select
          name="sellingUnit"
          defaultValue={variant?.sellingUnit ?? "other"}
          className={fieldClassName()}
        >
          {SELLING_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClassName()}>
        Qty value
        <input
          name="quantityValue"
          type="number"
          step="any"
          defaultValue={variant?.quantityValue ?? ""}
          className={fieldClassName()}
          placeholder="250 / 1 for g/kg"
        />
      </label>
      <label className={labelClassName()}>
        Price (INR)
        <input
          name="price"
          type="number"
          step="0.01"
          required
          defaultValue={variant ? variant.pricePaise / 100 : ""}
          className={fieldClassName()}
        />
      </label>
      <label className={labelClassName()}>
        MRP (INR)
        <input
          name="mrp"
          type="number"
          step="0.01"
          defaultValue={
            variant?.mrpPaise != null ? variant.mrpPaise / 100 : ""
          }
          className={fieldClassName()}
        />
      </label>
      <label className={labelClassName()}>
        Weight (g)
        <input
          name="weightG"
          type="number"
          defaultValue={variant?.weightG ?? ""}
          className={fieldClassName()}
        />
      </label>
      <label className={labelClassName()}>
        Stock
        <input
          name="stockQty"
          type="number"
          defaultValue={variant?.stockQty ?? 0}
          className={fieldClassName()}
        />
      </label>
      <label className={labelClassName()}>
        Sort order
        <input
          name="sortOrder"
          type="number"
          defaultValue={variant?.sortOrder ?? 0}
          className={fieldClassName()}
        />
      </label>
      <label className={labelClassName()}>
        Low-stock threshold
        <input
          name="lowStockThreshold"
          type="number"
          defaultValue={variant?.lowStockThreshold ?? 5}
          className={fieldClassName()}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-3">
        <input
          type="checkbox"
          name="available"
          defaultChecked={variant?.available ?? true}
        />
        Available for sale
      </label>
      <div className="flex flex-wrap gap-2 sm:col-span-3">
        <AdminFormSubmitButton
          label={isEdit ? "Save variant" : "Add variant"}
          pendingLabel="Saving…"
          icon={isEdit ? "save" : "plus"}
        />
        {onCancel ? (
          <button
            type="button"
            className="rounded-lg border border-outline-variant/30 px-3 py-1.5 text-sm font-semibold"
            onClick={onCancel}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function ProductForm({
  product,
  categories,
  subcategories = [],
  supabase,
  layout = "page",
  onCreated,
  onModalRefresh,
}: {
  product: AdminProductDetail | null;
  categories: CategoryOption[];
  subcategories?: AdminSubcategoryRow[];
  supabase: boolean;
  layout?: "page" | "modal";
  onCreated?: (productId: string) => void;
  onModalRefresh?: () => void;
}) {
  const router = useRouter();
  const isNew = !product;
  const isModal = layout === "modal";
  const [name, setName] = useState(product?.name ?? "");
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [taglineTouched, setTaglineTouched] = useState(Boolean(product?.tagline));
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [tab, setTab] = useState<"details" | "variants" | "images" | "seo">(
    "details",
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [presetDraft, setPresetDraft] = useState<
    ReturnType<typeof variantPresetsForCategory>
  >([]);

  const categorySlug = useMemo(() => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.slug ?? product?.categorySlug ?? "";
  }, [categories, categoryId, product?.categorySlug]);

  const filteredSubcategories = useMemo(
    () => subcategories.filter((s) => s.categoryId === categoryId),
    [subcategories, categoryId],
  );

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

  function applyPresets() {
    setPresetDraft(variantPresetsForCategory(categorySlug));
    setShowAddVariant(true);
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
                  ? "Create the product, then add variants and images."
                  : "Update the story, pricing, and details shoppers see."
                : "Preview the form — saving needs a live connection."}
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
            { id: "seo" as const, label: "SEO", locked: isNew },
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
              <SlugField
                nameValue={name}
                defaultSlug={product?.slug ?? ""}
              />
              <label className={labelClassName()}>
                Category
                <select
                  name="categoryId"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
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
              {filteredSubcategories.length > 0 ? (
                <label className={labelClassName()}>
                  Subcategory
                  <select
                    name="subcategoryId"
                    defaultValue={product?.subcategoryId ?? ""}
                    className={fieldClassName()}
                  >
                    <option value="">— None —</option>
                    {filteredSubcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <input type="hidden" name="subcategoryId" value="" />
              )}
              {product?.sourceName ? (
                <label className={labelClassName()}>
                  Source name (import)
                  <input
                    readOnly
                    value={product.sourceName}
                    className={`${fieldClassName()} bg-surface-container-low`}
                  />
                </label>
              ) : null}
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
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" name="seasonal" defaultChecked={product?.seasonal ?? false} />
                Seasonal
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

      {tab === "seo" && product ? (
        <form action={handleSaveProduct} className="space-y-6">
          <input type="hidden" name="id" value={product.id} />
          {isModal ? <input type="hidden" name="returnTo" value="modal" /> : null}
          <input type="hidden" name="name" value={product.name} />
          <input type="hidden" name="slug" value={product.slug} />
          <input type="hidden" name="categoryId" value={product.categoryId ?? ""} />
          <input type="hidden" name="subcategoryId" value={product.subcategoryId ?? ""} />
          <input type="hidden" name="description" value={product.description} />
          <input type="hidden" name="longDescription" value={product.longDescription ?? ""} />
          <input type="hidden" name="spiceNote" value={product.spiceNote ?? ""} />
          <input type="hidden" name="dietary" value={product.dietary.join(",")} />
          <input type="hidden" name="badge" value={product.badge ?? ""} />
          <input type="hidden" name="tagline" value={product.tagline ?? ""} />
          <input type="hidden" name="origin" value={product.origin ?? ""} />
          <input type="hidden" name="shelfLife" value={product.shelfLife ?? ""} />
          <input type="hidden" name="ingredients" value={product.ingredients.join(",")} />
          {product.published ? <input type="hidden" name="published" value="on" /> : null}
          {product.featured ? <input type="hidden" name="featured" value="on" /> : null}
          {product.bestseller ? <input type="hidden" name="bestseller" value="on" /> : null}
          {product.newArrival ? <input type="hidden" name="newArrival" value="on" /> : null}
          {product.seasonal ? <input type="hidden" name="seasonal" value="on" /> : null}

          <AdminCard title="Search engine optimization">
            <AdminFieldGrid>
              <label className={`${labelClassName()} ${adminFieldFullClassName()}`}>
                SEO title
                <input
                  name="seoTitle"
                  defaultValue={product.seoTitle ?? ""}
                  maxLength={120}
                  className={fieldClassName()}
                  placeholder="Overrides PDP title when set"
                />
              </label>
              <label className={`${labelClassName()} ${adminFieldFullClassName()}`}>
                SEO description
                <textarea
                  name="seoDescription"
                  defaultValue={product.seoDescription ?? ""}
                  maxLength={320}
                  rows={3}
                  className={fieldClassName()}
                />
              </label>
            </AdminFieldGrid>
          </AdminCard>
          <AdminFormSubmitButton label="Save SEO" pendingLabel="Saving…" icon="save" />
        </form>
      ) : null}

      {tab === "variants" && product ? (
        <AdminCard title="Variants / commerce">
          <ul className="mb-6 divide-y divide-outline-variant/15">
            {product.variants.map((v) => (
              <li key={v.id} className="py-3">
                {editingVariantId === v.id ? (
                  <VariantEditor
                    productId={product.id}
                    variant={v}
                    onSaved={() => {
                      setEditingVariantId(null);
                      onModalRefresh?.();
                    }}
                    onCancel={() => setEditingVariantId(null)}
                  />
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold">{v.label}</p>
                      <p className="text-xs text-on-surface-variant">
                        {v.sku} · {v.sellingUnit}
                        {v.quantityValue != null ? ` · qty ${v.quantityValue}` : ""} ·{" "}
                        {formatINR(v.pricePaise / 100)}
                        {v.mrpPaise ? ` (MRP ${formatINR(v.mrpPaise / 100)})` : ""} · stock{" "}
                        {v.stockQty}
                        {!v.available ? " · unavailable" : ""}
                      </p>
                    </div>
                    {supabase ? (
                      <AdminActionsMenu
                        ariaLabel="Variant actions"
                        items={[
                          {
                            id: "edit",
                            type: "button",
                            label: "Edit variant",
                            icon: "pencil",
                            onPress: () => setEditingVariantId(v.id),
                          },
                          {
                            id: "remove",
                            type: "form",
                            label: "Remove variant",
                            icon: "trash",
                            actionKey: "deleteVariant",
                            fields: { id: v.id, productId: product.id },
                            confirmMessage:
                              "Remove this variant? If referenced by orders it will be deactivated instead.",
                            danger: true,
                          },
                        ]}
                      />
                    ) : null}
                  </div>
                )}
              </li>
            ))}
            {!product.variants.length ? (
              <li className="py-4 text-sm text-on-surface-variant">No variants yet.</li>
            ) : null}
          </ul>

          {supabase ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-outline-variant/30 px-3 py-1.5 text-sm font-semibold"
                  onClick={() => {
                    setShowAddVariant((v) => !v);
                    setPresetDraft([]);
                  }}
                >
                  {showAddVariant ? "Hide add form" : "Add variant"}
                </button>
                {categorySlug ? (
                  <button
                    type="button"
                    className="rounded-lg bg-surface-container-high px-3 py-1.5 text-sm font-semibold"
                    onClick={applyPresets}
                  >
                    Load category presets
                  </button>
                ) : null}
              </div>

              {showAddVariant && !editingVariantId ? (
                presetDraft.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-on-surface-variant">
                      Preset rows — fill prices and save each variant.
                    </p>
                    {presetDraft.map((preset) => (
                      <VariantEditor
                        key={preset.label}
                        productId={product.id}
                        variant={{
                          id: "",
                          label: preset.label,
                          sku: "",
                          pricePaise: 0,
                          mrpPaise: null,
                          weightG: null,
                          sellingUnit: preset.sellingUnit,
                          quantityValue: preset.quantityValue,
                          stockQty: 0,
                          lowStockThreshold: 5,
                          available: true,
                          sortOrder: preset.sortOrder,
                        }}
                        onSaved={() => onModalRefresh?.()}
                      />
                    ))}
                  </div>
                ) : (
                  <VariantEditor
                    productId={product.id}
                    onSaved={() => {
                      setShowAddVariant(false);
                      onModalRefresh?.();
                    }}
                    onCancel={() => setShowAddVariant(false)}
                  />
                )
              ) : null}
            </div>
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
