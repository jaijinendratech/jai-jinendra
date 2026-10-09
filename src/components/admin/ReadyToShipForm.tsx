"use client";

import { useRouter } from "next/navigation";
import { toast } from "@heroui/react";
import { markReadyToShipAction } from "@/lib/admin/actions";
import { AdminFormSubmitButton } from "@/components/admin/AdminIconButton";

/**
 * "Mark ready to ship": makes sure the Shiprocket shipment + AWB exist and asks
 * the courier to collect the parcel. Failure reasons are shown as a toast and
 * kept on the order (pickup_error) so the admin can fix and retry.
 */
export function ReadyToShipForm({
  orderId,
  retry = false,
}: {
  orderId: string;
  retry?: boolean;
}) {
  const router = useRouter();
  return (
    <form
      action={async (formData) => {
        const result = await markReadyToShipAction(formData);
        if (result.ok) {
          toast.success(
            result.alreadyScheduled
              ? "Pickup was already scheduled"
              : "Marked ready to ship. Pickup requested from Shiprocket",
          );
        } else {
          toast.danger(result.error ?? "Could not request the pickup.");
        }
        router.refresh();
      }}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <AdminFormSubmitButton
        label={retry ? "Retry pickup request" : "Mark ready to ship"}
        pendingLabel="Requesting pickup…"
        icon="truck"
        variant="primary"
      />
    </form>
  );
}
