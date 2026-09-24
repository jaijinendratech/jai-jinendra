"use client";

import type { ReactNode } from "react";
import { Drawer, useOverlayState } from "@heroui/react";
import { cn } from "@/lib/cn";

/**
 * HeroUI side drawers hardcode `.drawer__dialog[data-placement=left|right]`
 * to `w-80 sm:w-96`. Size classes must land on Dialog (not Content) and
 * override those widths. Prefer auto width + max-width so panels hug content.
 */
const DRAWER_DIALOG_SIZE_CLASS = {
  md: "!w-auto min-w-[18rem] max-w-[min(100%,24rem)]",
  xl: "!w-auto min-w-[20rem] max-w-[min(100%,32rem)]",
  full: "!w-auto min-w-[22rem] max-w-[min(100%,40rem)]",
} as const;

export type AdminDrawerSize = keyof typeof DRAWER_DIALOG_SIZE_CLASS;

export function AdminDrawer({
  isOpen,
  onOpenChange,
  title,
  children,
  className,
  size = "md",
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  className?: string;
  size?: AdminDrawerSize;
}) {
  const state = useOverlayState({
    isOpen,
    onOpenChange,
  });

  return (
    <Drawer state={state}>
      <Drawer.Backdrop variant="blur" isDismissable>
        <Drawer.Content placement="right">
          <Drawer.Dialog
            className={cn(
              "rounded-l-xl border border-outline-variant/30 bg-surface shadow-lg",
              DRAWER_DIALOG_SIZE_CLASS[size],
              className,
            )}
          >
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading className="text-on-surface">{title}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="overflow-y-auto overflow-x-hidden pt-0">
              {children}
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
