"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { CartSummary } from "@/lib/cart/cart-service";

const empty: CartSummary = {
  items: [],
  itemCount: 0,
  subtotalPaise: 0,
  discountPaise: 0,
  shippingPaise: 0,
  totalPaise: 0,
  warnings: [],
};

type Listener = () => void;

let cartSnapshot: CartSummary = empty;
let loadingSnapshot = true;
let didInit = false;
let version = 0;
let fetchPromise: Promise<void> | null = null;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getCartSnapshot() {
  return cartSnapshot;
}

function getLoadingSnapshot() {
  return loadingSnapshot;
}

function getServerCartSnapshot() {
  return empty;
}

function getServerLoadingSnapshot() {
  return true;
}

function setCart(next: CartSummary) {
  version += 1;
  cartSnapshot = next;
  loadingSnapshot = false;
  emit();
}

async function fetchCart() {
  if (fetchPromise) return fetchPromise;
  const at = version;
  fetchPromise = (async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = (await res.json()) as CartSummary;
      if (at !== version) return;
      if (res.ok) setCart(data);
      else {
        loadingSnapshot = false;
        emit();
      }
    } catch {
      if (at !== version) return;
      loadingSnapshot = false;
      emit();
    } finally {
      fetchPromise = null;
    }
  })();
  return fetchPromise;
}

export function useCart() {
  const cart = useSyncExternalStore(
    subscribe,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const loading = useSyncExternalStore(
    subscribe,
    getLoadingSnapshot,
    getServerLoadingSnapshot,
  );

  useEffect(() => {
    if (didInit) return;
    didInit = true;
    void fetchCart();
  }, []);

  const refresh = useCallback(async () => {
    loadingSnapshot = true;
    emit();
    await fetchCart();
  }, []);

  const updateItem = useCallback(
    async (payload: { sku?: string; variantId?: string; qty: number }) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update cart");
      setCart(data as CartSummary);
      return data as CartSummary;
    },
    [],
  );

  return { cart, loading, refresh, updateItem };
}
