"use client";

import { useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button, Dropdown, Label } from "@heroui/react";
import { LuEllipsisVertical } from "react-icons/lu";
import { cn } from "@/lib/cn";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import type { AdminIconName } from "@/components/admin/admin-icons";
import { AdminIcon } from "@/components/admin/admin-icons";
import {
  deleteCategoryAction,
  deleteComboAction,
  deleteMediaAssetAction,
  deleteOutletAction,
  deleteProductAction,
  deleteProductImageAction,
  deleteSubcategoryAction,
  deleteVariantAction,
  duplicateProductAction,
} from "@/lib/admin/actions";

/** Stable keys — resolve server actions inside this client module so form bindings stay valid after HMR. */
export const adminFormActions = {
  deleteProduct: deleteProductAction,
  duplicateProduct: duplicateProductAction,
  deleteCategory: deleteCategoryAction,
  deleteSubcategory: deleteSubcategoryAction,
  deleteOutlet: deleteOutletAction,
  deleteCombo: deleteComboAction,
  deleteMedia: deleteMediaAssetAction,
  deleteVariant: deleteVariantAction,
  deleteProductImage: deleteProductImageAction,
} as const;

export type AdminFormActionKey = keyof typeof adminFormActions;

export type AdminMenuLinkItem = {
  id: string;
  type: "link";
  label: string;
  icon: AdminIconName;
  href: string;
  /** Prefetch the route chunk (Next.js Link default is true). */
  prefetch?: boolean;
};

export type AdminMenuButtonItem = {
  id: string;
  type: "button";
  label: string;
  icon: AdminIconName;
  onPress: () => void;
  /** Optional hover/focus preload (e.g. dynamic import of a heavy form). */
  onPreload?: () => void;
};

export type AdminMenuFormItem = {
  id: string;
  type: "form";
  label: string;
  icon: AdminIconName;
  actionKey: AdminFormActionKey;
  fields: Record<string, string>;
  confirmMessage?: string;
  danger?: boolean;
};

export type AdminMenuItem =
  | AdminMenuLinkItem
  | AdminMenuButtonItem
  | AdminMenuFormItem;

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
  const [, startTransition] = useTransition();

  if (!items.length) return null;

  const formItems = items.filter(
    (item): item is AdminMenuFormItem => item.type === "form",
  );

  function runAction(item: AdminMenuFormItem) {
    const action = adminFormActions[item.actionKey];
    const formData = new FormData();
    for (const [name, value] of Object.entries(item.fields)) {
      formData.set(name, value);
    }
    startTransition(() => {
      void action(formData);
    });
  }

  return (
    <div className="inline-flex">
      {/* Keep hidden forms for progressive enhancement / accessibility; actions resolve from registry */}
      {formItems.map((item) => (
        <form
          key={item.id}
          id={`${baseId}-${item.id}`}
          ref={(node) => {
            formRefs.current[item.id] = node;
          }}
          action={adminFormActions[item.actionKey]}
          className="hidden"
          onSubmit={(e) => {
            e.preventDefault();
            runAction(item);
          }}
        >
          {Object.entries(item.fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
        </form>
      ))}

      <Dropdown>
        <Button
          isIconOnly
          aria-label={ariaLabel}
          variant="ghost"
          size="sm"
          className="min-w-8 text-on-surface-variant"
        >
          <LuEllipsisVertical className="h-4 w-4" />
        </Button>
        <Dropdown.Popover placement="bottom end">
          <Dropdown.Menu
            onAction={(key) => {
              const item = items.find((entry) => entry.id === key);
              if (!item) return;
              if (item.type === "button") {
                item.onPress();
                return;
              }
              if (item.type !== "form") return;
              if (item.confirmMessage) {
                setPendingConfirm(item);
                return;
              }
              runAction(item);
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
                      prefetch={item.prefetch}
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

              if (item.type === "button") {
                return (
                  <Dropdown.Item
                    key={item.id}
                    id={item.id}
                    textValue={item.label}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="flex w-full items-center gap-2"
                      onMouseEnter={item.onPreload}
                      onFocus={item.onPreload}
                    >
                      <AdminIcon
                        name={item.icon}
                        className="h-4 w-4 shrink-0 text-on-surface-variant"
                      />
                      <Label>{item.label}</Label>
                    </span>
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
          if (pendingConfirm) runAction(pendingConfirm);
        }}
      />
    </div>
  );
}
