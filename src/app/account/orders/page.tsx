import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Orders
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Your complete order history.
        </p>
      </div>

      {params.confirmed ? (
        <p className="rounded-lg border border-secondary/30 bg-secondary-container/30 px-4 py-3 text-sm">
          Order <strong>{params.confirmed}</strong> placed successfully.
          Confirmation email sent if configured.
        </p>
      ) : null}

      {orders.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          No orders yet.{" "}
          <Link href="/catalogue" className="text-primary hover:underline">
            Start shopping
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-outline-variant/20 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm transition hover:bg-surface-container-low/60"
              >
                <div>
                  <p className="font-semibold text-primary">
                    {order.order_number}
                  </p>
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
