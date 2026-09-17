"use client";

import { deleteCategoryAction } from "@/lib/admin/actions";
import {
  AdminActionsMenu,
  type AdminMenuItem,
} from "@/components/admin/AdminActionsMenu";

export function CategoryRowActions({
  id,
  productCount,
}: {
  id: string;
  productCount: number;
}) {
  const items: AdminMenuItem[] = [
    {
      id: "edit",
      type: "link",
      label: "Edit",
      icon: "pencil",
      href: `/admin/categories?edit=${id}`,
    },
    {
      id: "delete",
      type: "form",
      label: "Delete",
      icon: "trash",
      action: deleteCategoryAction,
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
