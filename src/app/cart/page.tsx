import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your artisanal namkeens, mithai, and festive hampers before checkout.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Your Cart" },
        ]}
      />

      <div className="mb-5 flex flex-col justify-between gap-2 md:mb-8 md:flex-row md:items-end md:gap-3">
        <div>
          <p className="label-sm uppercase tracking-widest text-primary">Checkout</p>
          <h1 className="font-display mt-1 text-2xl font-semibold text-on-surface md:text-3xl">
            Your Cart
          </h1>
          <p className="mt-1.5 text-sm text-on-surface-variant md:mt-2">
            <span className="md:hidden">Review items, then checkout.</span>
            <span className="hidden md:inline">
              Review items before signing in and completing checkout.
            </span>
          </p>
        </div>
        <Link href="/catalogue" className="text-sm font-semibold text-primary hover:underline">
          <span className="md:hidden">Keep shopping</span>
          <span className="hidden md:inline">Continue shopping</span>
        </Link>
      </div>

      <CartView />
    </main>
  );
}
