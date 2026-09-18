"use client";

import { adjustInventoryAction } from "@/lib/admin/actions";
import { fieldClassName } from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";

export function InventoryAdjustForm({ variantId }: { variantId: string }) {
  return (
    <form
      action={adjustInventoryAction}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="reason" value="manual_adjust" />
      <input
        name="delta"
        type="number"
        placeholder="+/-"
        required
        className={`${fieldClassName()} mt-0! w-24`}
        aria-label="Stock delta"
      />
      <AdminIconButton
        type="submit"
        label="Apply"
        icon="check"
        variant="primary"
        showLabel
      />
    </form>
  );
}
