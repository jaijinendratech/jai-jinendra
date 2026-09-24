"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { Alert, toast } from "@heroui/react";
import { useCart } from "@/lib/cart/use-cart";
import { formatINR } from "@/lib/format";
import { signOutAction } from "@/lib/auth";

const ADMIN_CHECKOUT_NOTICE =
  "You're logged in as admin. Please sign out and log in as a customer to complete your purchase.";

type CartViewProps = {
  /** Soft-guard: admin still hits server redirect if they navigate to /checkout. */
  isAdmin?: boolean;
  /** From `?notice=` — latched so the banner survives SearchParamToasts URL cleanup. */
  notice?: string;
};

function AdminCustomerNoticeAlert() {
  return (
    <Alert
      status="warning"
      className="mb-5"
      data-testid="admin-customer-notice"
    >
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Customer account required</Alert.Title>
        <Alert.Description>{ADMIN_CHECKOUT_NOTICE}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}

export function CartView({ isAdmin = false, notice }: CartViewProps) {
  const { cart, loading, updateItem } = useCart();
  // Latch on first paint so the banner stays after SearchParamToasts cleans the URL.
  const [showAdminNotice] = useState(
    () => notice === "admin_customer_required",
  );

  if (loading) {
    return (
      <div>
        {showAdminNotice ? <AdminCustomerNoticeAlert /> : null}
        <p className="text-sm text-on-surface-variant">Loading cart…</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div>
        {showAdminNotice ? <AdminCustomerNoticeAlert /> : null}
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-8 text-center">
          <p className="text-on-surface-variant">Your cart is empty.</p>
          <Link href="/catalogue" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
            <span className="md:hidden">Shop Now</span>
            <span className="hidden md:inline">Browse catalogue</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showAdminNotice ? <AdminCustomerNoticeAlert /> : null}
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-8">
        {cart.warnings.length > 0 ? (
          <div className="rounded-lg border border-error/30 bg-error-container/30 px-4 py-3 text-sm text-error">
            {cart.warnings.join(" · ")}
          </div>
        ) : null}

        {cart.items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 sm:flex-row"
          >
            <Link
              href={`/products/${item.productSlug}`}
              className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-surface-container-low sm:h-28 sm:w-28"
            >
              <Image src={item.image} alt={item.productName} fill sizes="112px" className="object-cover" />
            </Link>
            <div className="flex flex-1 flex-col justify-between gap-2">
              <div>
                <Link
                  href={`/products/${item.productSlug}`}
                  className="font-display text-lg font-semibold text-on-surface hover:text-primary"
                >
                  {item.productName}
                </Link>
                <p className="mt-1 text-xs text-on-surface-variant">{item.label}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-stretch overflow-hidden rounded border border-outline-variant/40">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    className="flex w-9 items-center justify-center hover:bg-surface-container-low"
                    onClick={() => void updateItem({ variantId: item.variantId, qty: item.qty - 1 })}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="numeric flex min-w-10 items-center justify-center border-x border-outline-variant/40 text-sm font-bold">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    className="flex w-9 items-center justify-center hover:bg-surface-container-low"
                    onClick={() => void updateItem({ variantId: item.variantId, qty: item.qty + 1 })}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="price text-lg font-bold text-on-surface">
                  {formatINR(item.lineTotalPaise / 100)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-xl border border-outline-variant/30 bg-surface-container-low p-5 lg:col-span-4">
        <h2 className="font-display text-xl font-semibold text-on-surface">Order Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-on-surface-variant">
            <dt>Subtotal</dt>
            <dd className="price font-semibold text-on-surface">{formatINR(cart.subtotalPaise / 100)}</dd>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <dt>Shipping</dt>
            <dd className="price font-semibold text-secondary">
              {cart.shippingPaise === 0 ? "FREE" : formatINR(cart.shippingPaise / 100)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-outline-variant/30 pt-3 text-base">
            <dt className="font-semibold text-on-surface">Total</dt>
            <dd className="price font-bold text-on-surface">{formatINR(cart.totalPaise / 100)}</dd>
          </div>
        </dl>
        {isAdmin ? (
          <div className="mt-5 space-y-3">
            <button
              type="button"
              className="block w-full rounded-lg bg-primary-container py-3 text-center text-sm font-semibold text-white hover:bg-primary"
              onClick={() => toast.warning(ADMIN_CHECKOUT_NOTICE)}
            >
              <span className="md:hidden">Checkout</span>
              <span className="hidden md:inline">Proceed to Checkout</span>
            </button>
            <div className="space-y-1 text-center text-[11px] text-on-surface-variant">
              <p>Admin sessions cannot purchase.</p>
              <div>
                <form action={signOutAction} className="inline">
                  <button type="submit" className="font-semibold text-primary underline">
                    Sign out
                  </button>
                </form>
                <span>
                  , then{" "}
                  <Link href="/login?next=/checkout" className="font-semibold text-primary underline">
                    log in as a customer
                  </Link>
                  .
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Link
              href="/checkout"
              className="mt-5 block w-full rounded-lg bg-primary-container py-3 text-center text-sm font-semibold text-white hover:bg-primary"
            >
              <span className="md:hidden">Checkout</span>
              <span className="hidden md:inline">Proceed to Checkout</span>
            </Link>
            <p className="mt-3 text-center text-[11px] text-on-surface-variant">
              Free pan-India delivery on orders above ₹999
            </p>
          </>
        )}
      </aside>
    </div>
    </div>
  );
}
