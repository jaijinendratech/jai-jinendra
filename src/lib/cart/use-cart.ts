"use client";

import { useCallback, useEffect, useState } from "react";
import type { CartSummary } from "@/lib/cart/cart-service";

const empty: CartSummary = {
  items: [],
  itemCount: 0,
  subtotalPaise: 0,
  shippingPaise: 0,
  totalPaise: 0,
  warnings: [],
};

export function useCart() {
  const [cart, setCart] = useState<CartSummary>(empty);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setCart(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateItem = useCallback(
    async (payload: { sku?: string; variantId?: string; qty: number }) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update cart");
      setCart(data);
      return data as CartSummary;
    },
    [],
  );

  return { cart, loading, refresh, updateItem };
}
