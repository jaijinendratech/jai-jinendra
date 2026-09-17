import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order History",
  robots: { index: false, follow: false },
};

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const params = await searchParams;
  const user = await getSessionUser();
  let orders: {
    id: string;
    order_number: string;
    status: string;
    total_paise: number;
    created_at: string;
  }[] = [];

  if (isSupabaseConfigured() && user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, status, total_paise, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    orders = data ?? [];
  }

  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Orders" },
        ]}
      />

      <h1 className="font-display mt-4 text-3xl font-semibold text-on-surface">
        Order history
      </h1>

      {params.confirmed ? (
        <p className="mt-4 rounded-lg border border-secondary/30 bg-secondary-container/30 px-4 py-3 text-sm">
          Order <strong>{params.confirmed}</strong> placed successfully. Confirmation email sent if configured.
        </p>
      ) : null}

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-on-surface-variant">
          No orders yet.{" "}
          <Link href="/catalogue" className="text-primary hover:underline">
            Start shopping
          </Link>
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-outline-variant/20 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
              <div>
                <p className="font-semibold text-on-surface">{order.order_number}</p>
                <p className="text-on-surface-variant">
                  {new Date(order.created_at).toLocaleDateString("en-IN")} ·{" "}
                  <span className="capitalize">{order.status.replace(/_/g, " ")}</span>
                </p>
              </div>
              <p className="price font-bold">{formatINR(order.total_paise / 100)}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
