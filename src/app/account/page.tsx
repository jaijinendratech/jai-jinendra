import type { Metadata } from "next";
import Link from "next/link";
import { getProfile, getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default async function AccountOverviewPage() {
  const user = await getSessionUser();
  const profile = user ? await getProfile(user.id) : null;

  let recentOrders: {
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
      .order("created_at", { ascending: false })
      .limit(3);
    recentOrders = data ?? [];
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-outline-variant/30 bg-[linear-gradient(145deg,#fff8f0_0%,#ffffff_55%,#f7efe4_100%)] p-6">
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Overview
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Manage orders, profile details, and delivery addresses in one place.
        </p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-on-surface-variant">Phone</dt>
            <dd className="font-semibold">
              {profile?.phone ?? user?.phone ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-on-surface-variant">Email</dt>
            <dd className="font-semibold">
              {profile?.email ?? user?.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-on-surface-variant">Name</dt>
            <dd className="font-semibold">{profile?.full_name ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/account/orders", label: "View orders", body: "Track status and history" },
          { href: "/account/profile", label: "Edit profile", body: "Name, email, phone" },
          { href: "/account/addresses", label: "Addresses", body: "Delivery locations" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 transition hover:border-primary/40"
          >
            <p className="font-semibold text-primary">{item.label}</p>
            <p className="mt-1 text-sm text-on-surface-variant">{item.body}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Recent orders</h3>
          <Link
            href="/account/orders"
            className="text-sm font-semibold text-primary hover:underline"
          >
            See all
          </Link>
        </div>

        {!recentOrders.length ? (
          <p className="mt-4 text-sm text-on-surface-variant">
            No orders yet.{" "}
            <Link href="/catalogue" className="text-primary hover:underline">
              Start shopping
            </Link>
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-outline-variant/20">
            {recentOrders.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {order.order_number}
                  </Link>
                  <p className="text-on-surface-variant">
                    {new Date(order.created_at).toLocaleDateString("en-IN")} ·{" "}
                    <span className="capitalize">
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </p>
                </div>
                <p className="price font-bold">
                  {formatINR(order.total_paise / 100)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
