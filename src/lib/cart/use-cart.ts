"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { CartLine, CartSummary } from "@/lib/cart/cart-service";
import { calculateOrderTotals } from "@/lib/shipping";

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

/** What a card already knows about a variant, used to show the change instantly. */
export type OptimisticLine = Pick<
  CartLine,
  | "variantId"
  | "sku"
  | "label"
  | "productName"
  | "productSlug"
  | "image"
  | "unitPricePaise"
  | "stockQty"
>;

function recalc(items: CartLine[]): CartSummary {
  const subtotalPaise = items.reduce((sum, i) => sum + i.lineTotalPaise, 0);
  const totals = calculateOrderTotals(subtotalPaise);
  return {
    ...cartSnapshot,
    items,
    itemCount: items.reduce((sum, i) => sum + i.qty, 0),
    subtotalPaise: totals.subtotalPaise,
    discountPaise: totals.discountPaise,
    shippingPaise: totals.shippingPaise,
    totalPaise: totals.totalPaise,
  };
}

/** Apply a quantity change to the shared snapshot without waiting for the server. */
function applyOptimistic(line: OptimisticLine, qty: number) {
  const without = cartSnapshot.items.filter((i) => i.variantId !== line.variantId);
  const existing = cartSnapshot.items.find((i) => i.variantId === line.variantId);
  const items =
    qty <= 0
      ? without
      : [
          ...without,
          {
            id: existing?.id ?? `optimistic-${line.variantId}`,
            ...line,
            qty,
            lineTotalPaise: line.unitPricePaise * qty,
          },
        ];
  // Not setCart(): keep `version` untouched so a late server response still wins.
  cartSnapshot = recalc(items);
  loadingSnapshot = false;
  emit();
}

// One in-flight request per variant, latest quantity wins, so rapid +/- taps
// can't land out of order on the server.
const pending = new Map<string, { qty: number; running: boolean }>();

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

  /**
   * Instant +/- for a known variant: the UI updates immediately, requests are
   * serialised per variant (latest quantity wins) and the snapshot rolls back
   * to the server's truth if the request fails.
   */
  const setQuantity = useCallback(
    async (line: OptimisticLine, qty: number) => {
      applyOptimistic(line, qty);
      const key = line.variantId;
      const slot = pending.get(key);
      if (slot) {
        slot.qty = qty;
        return;
      }
      const entry = { qty, running: true };
      pending.set(key, entry);
      let sent = -1;
      try {
        while (sent !== entry.qty) {
          sent = entry.qty;
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ variantId: key, qty: sent }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Failed to update cart");
          // Only adopt the server copy once no newer tap is waiting.
          if (sent === entry.qty) setCart(data as CartSummary);
        }
      } catch (err) {
        pending.delete(key);
        await fetchCart(); // roll back to server truth
        throw err;
      }
      pending.delete(key);
    },
    [],
  );

  return { cart, loading, refresh, updateItem, setQuantity };
}
