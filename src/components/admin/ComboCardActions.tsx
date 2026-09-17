"use client";

import { deleteComboAction } from "@/lib/admin/actions";
import {
  AdminActionsMenu,
  type AdminMenuItem,
} from "@/components/admin/AdminActionsMenu";

export function ComboCardActions({ id }: { id: string }) {
  const items: AdminMenuItem[] = [
    {
      id: "edit",
      type: "link",
      label: "Edit",
      icon: "pencil",
      href: `/admin/combos?edit=${id}`,
    },
    {
      id: "delete",
      type: "form",
      label: "Delete combo",
      icon: "trash",
      action: deleteComboAction,
      fields: { id },
      confirmMessage: "Delete this combo?",
      danger: true,
    },
  ];

  return <AdminActionsMenu items={items} ariaLabel="Combo actions" />;
}
