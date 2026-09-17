"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { Button, Dropdown, Label } from "@heroui/react";
import { LuEllipsisVertical } from "react-icons/lu";
import { cn } from "@/lib/cn";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminIconTooltip } from "@/components/admin/AdminIconTooltip";
import type { AdminIconName } from "@/components/admin/admin-icons";
import { AdminIcon } from "@/components/admin/admin-icons";

export type AdminMenuLinkItem = {
  id: string;
  type: "link";
  label: string;
  icon: AdminIconName;
  href: string;
};

export type AdminMenuFormItem = {
  id: string;
  type: "form";
  label: string;
  icon: AdminIconName;
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  confirmMessage?: string;
  danger?: boolean;
};

export type AdminMenuItem = AdminMenuLinkItem | AdminMenuFormItem;

export function AdminActionsMenu({
  items,
  ariaLabel = "Actions",
}: {
  items: AdminMenuItem[];
  ariaLabel?: string;
}) {
  const baseId = useId();
  const formRefs = useRef<Record<string, HTMLFormElement | null>>({});
  const [pendingConfirm, setPendingConfirm] = useState<AdminMenuFormItem | null>(
    null,
  );

  if (!items.length) return null;

  const formItems = items.filter((item): item is AdminMenuFormItem => item.type === "form");

  function submitForm(itemId: string) {
    formRefs.current[itemId]?.requestSubmit();
  }

  return (
    <div className="inline-flex">
      {formItems.map((item) => (
        <form
          key={item.id}
          id={`${baseId}-${item.id}`}
          ref={(node) => {
            formRefs.current[item.id] = node;
          }}
          action={item.action}
          className="hidden"
        >
          {Object.entries(item.fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
        </form>
      ))}

      <Dropdown>
        <AdminIconTooltip label={ariaLabel}>
          <Button
            isIconOnly
            aria-label={ariaLabel}
            variant="ghost"
            size="sm"
            className="min-w-8 text-on-surface-variant"
          >
            <LuEllipsisVertical className="h-4 w-4" />
          </Button>
        </AdminIconTooltip>
        <Dropdown.Popover placement="bottom end">
          <Dropdown.Menu
            onAction={(key) => {
              const item = items.find((entry) => entry.id === key);
              if (!item || item.type !== "form") return;
              if (item.confirmMessage) {
                setPendingConfirm(item);
                return;
              }
              submitForm(item.id);
            }}
          >
            {items.map((item) => {
              if (item.type === "link") {
                return (
                  <Dropdown.Item
                    key={item.id}
                    id={item.id}
                    textValue={item.label}
                    className="p-0"
                  >
                    <Link
                      href={item.href}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-sm font-medium text-on-surface"
                    >
                      <AdminIcon
                        name={item.icon}
                        className="h-4 w-4 shrink-0 text-on-surface-variant"
                      />
                      <Label>{item.label}</Label>
                    </Link>
                  </Dropdown.Item>
                );
              }

              return (
                <Dropdown.Item
                  key={item.id}
                  id={item.id}
                  textValue={item.label}
                  variant={item.danger ? "danger" : undefined}
                  className={cn(
                    "flex items-center gap-2",
                    item.danger && "text-red-700",
                  )}
                >
                  <AdminIcon name={item.icon} className="h-4 w-4 shrink-0" />
                  <Label>{item.label}</Label>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      <AdminConfirmDialog
        isOpen={pendingConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setPendingConfirm(null);
        }}
        title={pendingConfirm?.confirmMessage ?? "Confirm"}
        message="This action cannot be undone."
        confirmLabel={pendingConfirm?.label ?? "Confirm"}
        danger={pendingConfirm?.danger ?? true}
        onConfirm={() => {
          if (pendingConfirm) submitForm(pendingConfirm.id);
        }}
      />
    </div>
  );
}
