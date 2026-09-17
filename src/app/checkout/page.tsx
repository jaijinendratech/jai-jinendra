import type { Metadata } from "next";
import Script from "next/script";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <main className="container-jj py-6 md:py-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />
        <h1 className="font-display mt-4 text-3xl font-semibold text-on-surface">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Pan-India delivery · Free shipping on orders above ₹999
        </p>
        <div className="mt-8">
          <CheckoutForm />
        </div>
      </main>
    </>
  );
}
