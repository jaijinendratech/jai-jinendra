"use client";

import {
  AdminActionsMenu,
  type AdminMenuItem,
} from "@/components/admin/AdminActionsMenu";

export function ComboCardActions({
  id,
  onEdit,
}: {
  id: string;
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
      label: "Delete combo",
      icon: "trash",
      actionKey: "deleteCombo",
      fields: { id },
      confirmMessage: "Delete this combo?",
      danger: true,
    },
  ];

  return <AdminActionsMenu items={items} ariaLabel="Combo actions" />;
}
