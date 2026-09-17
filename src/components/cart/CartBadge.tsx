"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/use-cart";
import { formatINR } from "@/lib/format";

export function CartBadge() {
  const { cart, loading } = useCart();

  return (
    <Link
      href="/cart"
      aria-label="Cart"
      className="group inline-flex h-auto items-center gap-2 rounded-full border border-primary/20 bg-surface-container-lowest/80 px-3.5 py-2 text-on-surface shadow-sm transition hover:border-primary-container hover:bg-primary-container hover:text-white"
    >
      <ShoppingBag className="h-4 w-4 text-primary transition group-hover:text-white" />
      <span className="hidden text-[12px] font-bold uppercase tracking-wide sm:inline">
        Cart{" "}
        <span className="text-primary group-hover:text-primary-fixed">
          ({loading ? "…" : cart.itemCount})
        </span>{" "}
        •{" "}
        <span className="price">
          {loading ? "…" : formatINR(cart.totalPaise / 100)}
        </span>
      </span>
    </Link>
  );
}
