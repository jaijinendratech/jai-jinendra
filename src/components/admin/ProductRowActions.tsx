"use client";

import type { AdminProductListItem } from "@/lib/admin/queries";
import {
  AdminActionsMenu,
  type AdminMenuItem,
} from "@/components/admin/AdminActionsMenu";
import { preloadProductForm } from "@/components/admin/ProductEditModal";

export function ProductRowActions({
  product,
  supabaseOn,
  onEdit,
}: {
  product: AdminProductListItem;
  supabaseOn: boolean;
  onEdit: (id: string) => void;
}) {
  const items: AdminMenuItem[] = [
    {
      id: "edit",
      type: "button",
      label: "Edit",
      icon: "pencil",
      onPress: () => onEdit(product.id),
      onPreload: preloadProductForm,
    },
  ];

  if (supabaseOn) {
    items.push(
      {
        id: "duplicate",
        type: "form",
        label: "Duplicate",
        icon: "copy",
        actionKey: "duplicateProduct",
        fields: { id: product.id },
      },
      {
        id: "delete",
        type: "form",
        label: "Delete",
        icon: "trash",
        actionKey: "deleteProduct",
        fields: { id: product.id },
        confirmMessage: "Delete this product permanently?",
        danger: true,
      },
    );
  }

  return <AdminActionsMenu items={items} />;
}
