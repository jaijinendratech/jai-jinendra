"use client";

import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/use-cart";

export function CartBadge() {
  const { cart, loading } = useCart();
  const count = cart.itemCount;
  const label =
    count > 0
      ? `Cart, ${count} item${count === 1 ? "" : "s"}`
      : "Cart, empty";

  return (
    <Link
      href="/cart"
      aria-label={label}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
    >
      <ShoppingBag className="h-5 w-5" aria-hidden />
      {loading && count === 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
          <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden />
        </span>
      ) : count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
