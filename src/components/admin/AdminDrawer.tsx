"use client";

import type { ReactNode } from "react";
import { Drawer, useOverlayState } from "@heroui/react";
import { cn } from "@/lib/cn";

export function AdminDrawer({
  isOpen,
  onOpenChange,
  title,
  children,
  className,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const state = useOverlayState({
    isOpen,
    onOpenChange,
  });

  return (
    <Drawer state={state}>
      <Drawer.Backdrop variant="blur" isDismissable>
        <Drawer.Content
          placement="right"
          className={cn("w-full max-w-lg sm:max-w-xl", className)}
        >
          <Drawer.Dialog className="rounded-l-xl border border-outline-variant/30 bg-surface shadow-lg">
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading className="text-on-surface">{title}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="pt-0">{children}</Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
