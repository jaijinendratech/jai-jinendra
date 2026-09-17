"use client";

import { deleteOutletAction } from "@/lib/admin/actions";
import {
  AdminActionsMenu,
  type AdminMenuItem,
} from "@/components/admin/AdminActionsMenu";

export function OutletRowActions({ id }: { id: string }) {
  const items: AdminMenuItem[] = [
    {
      id: "edit",
      type: "link",
      label: "Edit",
      icon: "pencil",
      href: `/admin/outlets?edit=${id}`,
    },
    {
      id: "delete",
      type: "form",
      label: "Delete",
      icon: "trash",
      action: deleteOutletAction,
      fields: { id },
      confirmMessage: "Delete this outlet?",
      danger: true,
    },
  ];

  return <AdminActionsMenu items={items} />;
}
