import type { Metadata } from "next";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import {
  getDashboardKpis,
  getRevenueSeries,
  getOrderSeries,
  getOrderStatusDistribution,
  getCategoryDistribution,
  getTopProducts,
  getLowStockItems,
  getAdminOrders,
  getAdminEnquiries,
  getIntegrationStatus,
} from "@/lib/admin/queries";
import {
  AdminCard,
  AdminPageHeader,
  KpiCard,
  StatusBadge,
} from "@/components/admin/ui";
import {
  AdminBarChart,
  AdminDonutChart,
  AdminLineChart,
} from "@/components/admin/charts";
import { ORDER_STATUS_LABELS } from "@/lib/admin/status";
import type { OrderStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const days = Number(params.days ?? 14) || 14;
  const live = getIntegrationStatus().supabase;

  const [
    kpis,
    revenue,
    ordersSeries,
    statusDist,
    categoryDist,
    topProducts,
    lowStock,
    orders,
    enquiries,
  ] = await Promise.all([
    getDashboardKpis(),
    getRevenueSeries(days),
    getOrderSeries(days),
    getOrderStatusDistribution(),
    getCategoryDistribution(),
    getTopProducts(5),
    getLowStockItems(6),
    getAdminOrders(),
    getAdminEnquiries(),
  ]);

  const statusChart = statusDist.map((d) => ({
    name: ORDER_STATUS_LABELS[d.name as OrderStatus] ?? d.name,
    value: d.value,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description={
          live
            ? "Live aggregates from Supabase."
            : "Computed from mock catalogue & sample orders (Supabase offline)."
        }
        actions={
          <div className="flex gap-2 text-xs">
            {[7, 14, 30].map((d) => (
              <Link
                key={d}
                href={`/admin?days=${d}`}
                className={`rounded-lg border px-3 py-1.5 font-semibold ${
                  days === d
                    ? "border-primary bg-primary text-white"
                    : "border-outline-variant/40 text-on-surface-variant"
                }`}
              >
                {d}d
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
        <KpiCard label="Revenue total" value={formatINR(kpis.revenueTotal)} />
        <KpiCard label="Revenue today" value={formatINR(kpis.revenueToday)} />
        <KpiCard label="Revenue month" value={formatINR(kpis.revenueMonth)} />
        <KpiCard label="Orders total" value={String(kpis.ordersTotal)} />
        <KpiCard label="Orders today" value={String(kpis.ordersToday)} />
        <KpiCard label="Pending orders" value={String(kpis.ordersPending)} />
        <KpiCard label="Completed" value={String(kpis.ordersCompleted)} />
        <KpiCard label="Cancelled" value={String(kpis.ordersCancelled)} />
        <KpiCard
          label="Products"
          value={`${kpis.productsActive}/${kpis.productsTotal}`}
          hint="active / total"
        />
        <KpiCard label="Low stock SKUs" value={String(kpis.productsLowStock)} />
        <KpiCard label="Customers" value={String(kpis.customers)} />
        <KpiCard
          label="Enquiries"
          value={`${kpis.enquiriesPending} new`}
          hint={`${kpis.enquiriesCorporate} corporate · ${kpis.outlets} outlets`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Revenue">
          <AdminLineChart data={revenue} />
        </AdminCard>
        <AdminCard title="Orders">
          <AdminBarChart data={ordersSeries} />
        </AdminCard>
        <AdminCard title="Order status">
          <AdminDonutChart data={statusChart} />
        </AdminCard>
        <AdminCard title="Products by category">
          <AdminDonutChart data={categoryDist} />
        </AdminCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard
          title="Recent orders"
          action={
            <Link href="/admin/orders" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          }
        >
          <ul className="divide-y divide-outline-variant/20">
            {orders.slice(0, 5).map((order) => (
              <li key={order.dbId} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-semibold text-on-surface hover:text-primary"
                  >
                    {order.id}
                  </Link>
                  <p className="text-xs text-on-surface-variant">
                    {order.customer} · {order.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="price font-bold">{formatINR(order.total)}</p>
                  <StatusBadge kind="order" value={order.status} />
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard
          title="Recent enquiries"
          action={
            <Link href="/admin/enquiries" className="text-sm font-semibold text-primary hover:underline">
              Inbox
            </Link>
          }
        >
          <ul className="divide-y divide-outline-variant/20">
            {enquiries.slice(0, 5).map((enquiry) => (
              <li key={enquiry.id} className="py-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-on-surface">
                      {enquiry.company || enquiry.name}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {enquiry.name} · {enquiry.type}
                    </p>
                  </div>
                  <StatusBadge kind="enquiry" value={enquiry.status} />
                </div>
              </li>
            ))}
            {!enquiries.length ? (
              <li className="py-6 text-center text-sm text-on-surface-variant">
                No enquiries yet
              </li>
            ) : null}
          </ul>
        </AdminCard>

        <AdminCard title="Top products">
          <ul className="divide-y divide-outline-variant/20">
            {topProducts.map((p) => (
              <li key={p.id} className="flex justify-between gap-3 py-3 text-sm">
                <span className="font-semibold text-on-surface">{p.name}</span>
                <span className="text-on-surface-variant">
                  {p.sold} sold · {formatINR(p.revenue)}
                </span>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard
          title="Low stock"
          action={
            <Link href="/admin/inventory" className="text-sm font-semibold text-primary hover:underline">
              Inventory
            </Link>
          }
        >
          <ul className="divide-y divide-outline-variant/20">
            {lowStock.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold text-on-surface">{item.productName}</p>
                  <p className="text-xs text-on-surface-variant">
                    {item.label} · {item.sku}
                  </p>
                </div>
                <StatusBadge
                  kind="stock"
                  value={item.stockQty <= 0 ? "out" : "low"}
                  label={`${item.stockQty} left`}
                />
              </li>
            ))}
            {!lowStock.length ? (
              <li className="py-6 text-center text-sm text-on-surface-variant">
                Stock levels look healthy
              </li>
            ) : null}
          </ul>
        </AdminCard>
      </div>
    </div>
  );
}
