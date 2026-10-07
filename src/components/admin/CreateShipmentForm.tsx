"use client";

import { useRouter } from "next/navigation";
import { toast } from "@heroui/react";
import { createShiprocketShipmentAction } from "@/lib/admin/actions";
import { AdminFormSubmitButton } from "@/components/admin/AdminIconButton";

/** Manual create / retry for a Shiprocket shipment. Shows the failure reason as a toast. */
export function CreateShipmentForm({
  orderId,
  label = "Create Shiprocket shipment",
}: {
  orderId: string;
  label?: string;
}) {
  const router = useRouter();
  return (
    <form
      action={async (formData) => {
        const result = await createShiprocketShipmentAction(formData);
        if (result.ok) {
          toast.success("Shiprocket shipment created");
        } else {
          toast.danger(result.error ?? "Could not create the shipment.");
        }
        router.refresh();
      }}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <AdminFormSubmitButton
        label={label}
        pendingLabel="Creating…"
        icon="truck"
        variant="primary"
      />
    </form>
  );
}
