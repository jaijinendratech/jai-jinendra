"use client";

import {
  AdminActionsMenu,
  type AdminMenuItem,
} from "@/components/admin/AdminActionsMenu";

export function OutletRowActions({
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
      label: "Delete",
      icon: "trash",
      actionKey: "deleteOutlet",
      fields: { id },
      confirmMessage: "Delete this outlet?",
      danger: true,
    },
  ];

  return <AdminActionsMenu items={items} />;
}
