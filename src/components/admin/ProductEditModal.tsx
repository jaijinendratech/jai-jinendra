"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useTransition } from "react";
import type { AdminProductDetail } from "@/lib/admin/queries";
import { loadAdminProductAction } from "@/lib/admin/actions";
import { AdminModal } from "@/components/admin/AdminModal";

const ProductForm = dynamic(
  () =>
    import("@/components/admin/ProductForm").then((m) => m.ProductForm),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 py-2" role="status" aria-label="Loading form">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-outline-variant/25" />
        <div className="h-40 animate-pulse rounded-xl bg-outline-variant/20" />
        <div className="h-40 animate-pulse rounded-xl bg-outline-variant/20" />
      </div>
    ),
  },
);

export function preloadProductForm() {
  void import("@/components/admin/ProductForm");
}

export type ProductModalState =
  | { mode: "create" }
  | { mode: "edit"; productId: string }
  | null;

export function ProductFormModal({
  state,
  categories,
  supabase,
  onClose,
  onCreated,
}: {
  state: ProductModalState;
  categories: { id: string; title: string }[];
  supabase: boolean;
  onClose: () => void;
  /** After create, parent should switch to edit mode for variants/images. */
  onCreated: (productId: string) => void;
}) {
  const isCreate = state?.mode === "create";
  const productId = state?.mode === "edit" ? state.productId : null;
  const open = state !== null;

  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [pending, startTransition] = useTransition();
  const loadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setError(null);
      loadedIdRef.current = null;
      return;
    }
    const idChanged = loadedIdRef.current !== productId;
    if (idChanged) {
      setProduct(null);
      loadedIdRef.current = productId;
    }
    setError(null);
    let cancelled = false;
    startTransition(async () => {
      try {
        const data = await loadAdminProductAction(productId);
        if (cancelled) return;
        if (!data) {
          setError("Product not found.");
          return;
        }
        setProduct(data);
      } catch {
        if (!cancelled) setError("Could not load product.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [productId, reloadToken]);

  const title = isCreate
    ? "Add product"
    : product
      ? `Edit · ${product.name}`
      : "Edit product";

  return (
    <AdminModal
      isOpen={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={title}
      size="cover"
    >
      {isCreate ? (
        <ProductForm
          key="create"
          product={null}
          categories={categories}
          supabase={supabase}
          layout="modal"
          onCreated={onCreated}
        />
      ) : error ? (
        <p className="py-6 text-sm text-red-700">{error}</p>
      ) : pending || !product ? (
        <div className="space-y-4 py-2" role="status" aria-label="Loading product">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-outline-variant/25" />
          <div className="h-40 animate-pulse rounded-xl bg-outline-variant/20" />
          <div className="h-40 animate-pulse rounded-xl bg-outline-variant/20" />
        </div>
      ) : (
        <ProductForm
          key={product.id}
          product={product}
          categories={categories}
          supabase={supabase}
          layout="modal"
          onCreated={onCreated}
          onModalRefresh={() => setReloadToken((n) => n + 1)}
        />
      )}
    </AdminModal>
  );
}

/** @deprecated Use ProductFormModal — kept as a thin alias for edit-only call sites. */
export function ProductEditModal({
  productId,
  categories,
  supabase,
  onClose,
}: {
  productId: string | null;
  categories: { id: string; title: string }[];
  supabase: boolean;
  onClose: () => void;
}) {
  return (
    <ProductFormModal
      state={productId ? { mode: "edit", productId } : null}
      categories={categories}
      supabase={supabase}
      onClose={onClose}
      onCreated={() => {}}
    />
  );
}
