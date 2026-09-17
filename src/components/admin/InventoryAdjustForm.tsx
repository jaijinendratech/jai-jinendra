"use client";

import { adjustInventoryAction } from "@/lib/admin/actions";
import { fieldClassName } from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";

export function InventoryAdjustForm({ variantId }: { variantId: string }) {
  return (
    <form
      action={adjustInventoryAction}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="variantId" value={variantId} />
      <input
        name="delta"
        type="number"
        placeholder="+/-"
        required
        className={`${fieldClassName()} mt-0! w-20`}
      />
      <input
        name="reason"
        defaultValue="manual_adjust"
        className={`${fieldClassName()} mt-0! w-32`}
      />
      <AdminIconButton
        type="submit"
        label="Apply adjustment"
        icon="check"
        variant="primary"
      />
    </form>
  );
}
