import type { Metadata } from "next";
import { getAdminCoupons, getIntegrationStatus } from "@/lib/admin/queries";
import { AdminPageHeader, NoticeBanner } from "@/components/admin/ui";
import { formatCouponValueLabel } from "@/lib/coupons";
import { CouponsManager } from "./CouponsManager";

export const metadata: Metadata = {
  title: "Admin · Coupons",
  robots: { index: false, follow: false },
};

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const coupons = await getAdminCoupons();
  const { supabase } = getIntegrationStatus();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coupons"
        description="Create percent or fixed discounts for checkout."
      />
      <NoticeBanner notice={notice} />
      <CouponsManager
        coupons={coupons.map((c) => ({
          id: c.id,
          code: c.code,
          type: c.type,
          value: c.value,
          minOrderPaise: c.minOrderPaise,
          maxDiscountPaise: c.maxDiscountPaise,
          active: c.active,
          startsAt: c.startsAt,
          expiresAt: c.expiresAt,
          usageLimit: c.usageLimit,
          usedCount: c.usedCount,
          valueLabel: formatCouponValueLabel(c.type, c.value),
        }))}
        supabase={supabase}
      />
    </div>
  );
}
