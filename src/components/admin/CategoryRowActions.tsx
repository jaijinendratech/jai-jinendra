"use client";

import {
  AdminActionsMenu,
  type AdminMenuItem,
} from "@/components/admin/AdminActionsMenu";

export function CategoryRowActions({
  id,
  productCount,
  onEdit,
}: {
  id: string;
  productCount: number;
  onEdit: (id: string) => void;
}) {
  const items: AdminMenuItem[] = [
    {
      id: "edit",
      type: "button",
      label: "Edit",
      icon: "pencil",
      onPress: () => onEdit(id),
    },
    {
      id: "delete",
      type: "form",
      label: "Delete",
      icon: "trash",
      actionKey: "deleteCategory",
      fields: { id },
      confirmMessage:
        productCount > 0
          ? "This category has linked products and cannot be deleted safely."
          : "Delete this category?",
      danger: true,
    },
  ];

  return <AdminActionsMenu items={items} />;
}
