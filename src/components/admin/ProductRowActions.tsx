"use client";

import {
  deleteProductAction,
  duplicateProductAction,
} from "@/lib/admin/actions";
import type { AdminProductListItem } from "@/lib/admin/queries";
import {
  AdminActionsMenu,
  type AdminMenuItem,
} from "@/components/admin/AdminActionsMenu";

export function ProductRowActions({
  product,
  supabaseOn,
}: {
  product: AdminProductListItem;
  supabaseOn: boolean;
}) {
  const items: AdminMenuItem[] = [
    {
      id: "edit",
      type: "link",
      label: "Edit",
      icon: "pencil",
      href: `/admin/products/${product.id}`,
    },
  ];

  if (supabaseOn) {
    items.push(
      {
        id: "duplicate",
        type: "form",
        label: "Duplicate",
        icon: "copy",
        action: duplicateProductAction,
        fields: { id: product.id },
      },
      {
        id: "delete",
        type: "form",
        label: "Delete",
        icon: "trash",
        action: deleteProductAction,
        fields: { id: product.id },
        confirmMessage: "Delete this product permanently?",
        danger: true,
      },
    );
  }

  return <AdminActionsMenu items={items} />;
}
