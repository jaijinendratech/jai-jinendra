import type { Metadata } from "next";
import { getAdminOfferLeads } from "@/lib/admin/queries";
import { AdminEmpty, AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Admin - Leads",
  robots: { index: false, follow: false },
};

export default async function AdminLeadsPage() {
  const leads = await getAdminOfferLeads();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Leads"
        description="Offer popup claims and coupon-code leads."
      />

      {!leads.length ? (
        <AdminEmpty
          title="No leads yet"
          description="Offer popup claims will show here."
        />
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-xl border border-outline-variant/25 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">
                    {lead.fullName}
                  </h2>
                  <p className="numeric mt-1 text-sm font-semibold text-on-surface-variant">
                    {lead.phone}
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary">
                  {lead.couponCode}
                </span>
              </div>
              <p className="numeric mt-3 text-xs text-outline">
                Claimed {new Date(lead.createdAt).toLocaleString("en-IN")}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
