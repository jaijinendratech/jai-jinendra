"use client";

import { toast } from "@heroui/react";
import { saveShippingSettingsAction } from "@/lib/admin/actions";
import { AdminFormSubmitButton } from "@/components/admin/AdminIconButton";
import { fieldClassName, labelClassName } from "@/components/admin/ui";
import type { ShippingRule } from "@/lib/shipping-rule";

/** Edits the charge customers pay at checkout (not what Shiprocket bills you). */
export function ShippingSettingsForm({ rule }: { rule: ShippingRule }) {
  return (
    <form
      action={async (formData) => {
        try {
          await saveShippingSettingsAction(formData);
          toast.success("Shipping settings saved");
        } catch (err) {
          toast.danger(
            err instanceof Error ? err.message : "Could not save shipping settings.",
          );
        }
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClassName()}>
          Shipping charge (₹)
          <input
            name="flatRupees"
            type="number"
            inputMode="decimal"
            min={0}
            step="1"
            required
            defaultValue={rule.flatPaise / 100}
            className={fieldClassName()}
          />
        </label>
        <label className={labelClassName()}>
          Free shipping on orders of (₹) or more
          <input
            name="freeAboveRupees"
            type="number"
            inputMode="decimal"
            min={0}
            step="1"
            required
            defaultValue={rule.freeAbovePaise / 100}
            className={fieldClassName()}
          />
        </label>
      </div>
      <p className="text-xs text-on-surface-variant">
        Applies to new carts and orders straight away; placed orders keep what
        they were charged. The threshold is checked on the subtotal before
        coupons. Set the charge to 0 for free shipping on everything.
      </p>
      <AdminFormSubmitButton
        label="Save shipping"
        pendingLabel="Saving…"
        icon="save"
        variant="primary"
      />
    </form>
  );
}
