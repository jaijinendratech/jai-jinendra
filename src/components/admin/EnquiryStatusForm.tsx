"use client";

import { updateEnquiryStatusAction } from "@/lib/admin/actions";
import { AdminStatusSelect } from "@/components/admin/AdminStatusSelect";
import { ENQUIRY_STATUS_LABELS } from "@/lib/admin/status";
import type { EnquiryStatus } from "@/types/database";

export function EnquiryStatusForm({
  id,
  status,
}: {
  id: string;
  status: EnquiryStatus;
}) {
  return (
    <AdminStatusSelect
      action={updateEnquiryStatusAction}
      fields={{ id }}
      value={status}
      kind="enquiry"
      options={(Object.keys(ENQUIRY_STATUS_LABELS) as EnquiryStatus[]).map(
        (s) => ({
          value: s,
          label: ENQUIRY_STATUS_LABELS[s],
        }),
      )}
    />
  );
}
