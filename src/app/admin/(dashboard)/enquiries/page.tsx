import type { Metadata } from "next";
import { getAdminEnquiries, getIntegrationStatus } from "@/lib/admin/queries";
import {
  AdminEmpty,
  AdminPageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import { EnquiryStatusForm } from "@/components/admin/EnquiryStatusForm";
import { ENQUIRY_STATUS_LABELS } from "@/lib/admin/status";
import type { EnquiryStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Admin · Enquiries",
  robots: { index: false, follow: false },
};

export default async function AdminEnquiriesPage() {
  const enquiries = await getAdminEnquiries();
  const { supabase } = getIntegrationStatus();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Enquiries"
        description={
          supabase
            ? "Inbox from enquiries table."
            : "Sample corporate enquiries (mock)."
        }
      />

      {!enquiries.length ? (
        <AdminEmpty
          title="Inbox empty"
          description="Corporate and support enquiries will show here."
        />
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <article
              key={enquiry.id}
              className="rounded-xl border border-outline-variant/25 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    {enquiry.type}
                    {enquiry.type === "corporate" ? " · Corporate" : ""}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-on-surface">
                    {enquiry.company || enquiry.name}
                  </h2>
                  <p className="text-sm text-on-surface-variant">
                    {enquiry.name} · {enquiry.email}
                  </p>
                </div>
                {supabase ? (
                  <EnquiryStatusForm
                    id={enquiry.id}
                    status={enquiry.status as EnquiryStatus}
                  />
                ) : (
                  <StatusBadge
                    kind="enquiry"
                    value={enquiry.status}
                    label={ENQUIRY_STATUS_LABELS[enquiry.status as EnquiryStatus]}
                  />
                )}
              </div>
              {enquiry.notes ? (
                <p className="mt-3 text-sm text-on-surface-variant">
                  {enquiry.notes}
                </p>
              ) : null}
              <p className="numeric mt-2 text-xs text-outline">
                {enquiry.quantity ? `Qty ${enquiry.quantity} · ` : ""}
                {new Date(enquiry.createdAt).toLocaleString("en-IN")}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
