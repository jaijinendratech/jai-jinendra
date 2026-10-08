import type { Metadata } from "next";
import Script from "next/script";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import {
  CheckoutForm,
  type SavedAddress,
} from "@/components/checkout/CheckoutForm";
import { requireUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await requireUser("/login?next=/checkout");
  let savedAddresses: SavedAddress[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("addresses")
      .select("id, name, phone, line1, line2, city, state, pincode, is_default")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    savedAddresses = (data as SavedAddress[] | null) ?? [];
  }

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
          <CheckoutForm
            savedAddresses={savedAddresses}
            defaultEmail={user.email ?? ""}
          />
        </div>
      </main>
    </>
  );
}
