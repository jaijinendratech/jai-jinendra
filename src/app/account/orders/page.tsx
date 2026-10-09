import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import {
  OrderStatusChip,
  PaymentMethodLabel,
} from "@/components/account/OrderBadges";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { formatINR } from "@/lib/format";
import { orderDisplayTitle } from "@/lib/orders/display";

export const metadata: Metadata = {
  title: "Order History",
  robots: { index: false, follow: false },
};

export default async function AccountOrdersPage() {
  const user = await getSessionUser();
  let orders: {
    id: string;
    status: string;
    order_items: { name_snapshot: string; qty: number }[];
    payment_method: string;
    total_paise: number;
    created_at: string;
  }[] = [];

  if (isSupabaseConfigured() && user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select(
        "id, status, payment_method, total_paise, created_at, order_items(name_snapshot, qty)",
      )
      .eq("user_id", user.id)
      // Unpaid online attempts are not orders.
      .neq("status", "pending_payment")
      .order("created_at", { ascending: false });
    orders = (data as typeof orders | null) ?? [];
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
            <li
              key={order.id}
              className="flex flex-wrap items-center gap-3 px-5 py-4 text-sm transition hover:bg-surface-container-low/60"
            >
              <Link
                href={`/account/orders/${order.id}`}
                className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-primary">
                    {orderDisplayTitle(order.order_items)}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-on-surface-variant">
                    <span>
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </span>
                    <span aria-hidden>·</span>
                    <OrderStatusChip status={order.status} />
                    <span aria-hidden>·</span>
                    <PaymentMethodLabel method={order.payment_method} />
                  </p>
                </div>
                <p className="price font-bold">
                  {formatINR(order.total_paise / 100)}
                </p>
              </Link>
              <a
                href={`/api/orders/${order.id}/invoice`}
                download
                aria-label="Download invoice"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-outline-variant/50 px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
              >
                <Download className="size-3.5" aria-hidden />
                Invoice
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
