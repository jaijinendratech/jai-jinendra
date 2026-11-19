"use client";

import {
  AdminActionsMenu,
  type AdminMenuItem,
} from "@/components/admin/AdminActionsMenu";

/** `orderId` is the human order number (used for the detail URL); `dbId` is the row uuid. */
export function OrderRowActions({
  orderId,
  dbId,
  enabled,
}: {
  orderId: string;
  dbId: string;
  enabled: boolean;
}) {
  const items: AdminMenuItem[] = [
    {
      id: "view",
      type: "link",
      label: "View order",
      icon: "eye",
      href: `/admin/orders/${orderId}`,
    },
  ];

  // Cancelling (with refund) lives in the Status dropdown, so there is one path.
  if (enabled) {
    items.push({
      id: "delete",
      type: "form",
      label: "Delete order",
      icon: "trash",
      actionKey: "deleteOrder",
      fields: { orderId: dbId },
      confirmMessage: `Delete order ${orderId}?`,
      confirmDescription:
        "The order and its items are permanently removed, reserved stock is returned, and revenue is recalculated. Payments are NOT refunded. To refund a prepaid order, set its status to Cancelled instead. This cannot be undone.",
      danger: true,
    });
  }

  return <AdminActionsMenu items={items} ariaLabel={`Actions for ${orderId}`} />;
}
