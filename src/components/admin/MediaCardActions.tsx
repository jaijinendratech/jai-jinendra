"use client";

import {
  AdminActionsMenu,
  type AdminMenuItem,
} from "@/components/admin/AdminActionsMenu";

export function MediaCardActions({ id }: { id: string }) {
  const items: AdminMenuItem[] = [
    {
      id: "remove",
      type: "form",
      label: "Remove",
      icon: "trash",
      actionKey: "deleteMedia",
      fields: { id },
      confirmMessage: "Remove this asset from the library?",
      danger: true,
    },
  ];

  return <AdminActionsMenu items={items} ariaLabel="Media actions" />;
}
