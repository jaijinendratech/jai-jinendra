import type { Metadata } from "next";
import { getAdminEnquiries, getIntegrationStatus } from "@/lib/admin/queries";
import { updateEnquiryStatusAction } from "@/lib/admin/actions";
import {
  AdminEmpty,
  AdminPageHeader,
  StatusBadge,
  fieldClassName,
  primaryBtnClassName,
} from "@/components/admin/ui";
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
                <StatusBadge
                  kind="enquiry"
                  value={enquiry.status}
                  label={ENQUIRY_STATUS_LABELS[enquiry.status as EnquiryStatus]}
                />
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

              {supabase ? (
                <form
                  action={updateEnquiryStatusAction}
                  className="mt-4 flex flex-wrap items-end gap-2"
                >
                  <input type="hidden" name="id" value={enquiry.id} />
                  <select
                    name="status"
                    defaultValue={enquiry.status}
                    className={`${fieldClassName()} mt-0! max-w-40`}
                  >
                    {(
                      Object.keys(ENQUIRY_STATUS_LABELS) as EnquiryStatus[]
                    ).map((s) => (
                      <option key={s} value={s}>
                        {ENQUIRY_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className={`${primaryBtnClassName()} py-2! text-xs`}
                  >
                    Update
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
