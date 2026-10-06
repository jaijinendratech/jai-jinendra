"use client";

import type { ReactNode } from "react";
import { Modal } from "@heroui/react";
import { cn } from "@/lib/cn";

type ModalSize = "xs" | "sm" | "md" | "lg" | "cover" | "full";

export function AdminModal({
  isOpen,
  onOpenChange,
  title,
  children,
  size = "lg",
  className,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  size?: ModalSize;
  className?: string;
}) {
  // Controlled open without Modal.Trigger, put isOpen on Backdrop.
  // <Modal state> wraps DialogTrigger and warns without a pressable child.
  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      variant="blur"
      isDismissable
    >
      <Modal.Container
        size={size}
        scroll="inside"
        placement="center"
        className={cn(
          "w-full",
          size === "lg" && "sm:max-w-3xl",
          size === "cover" && "sm:max-w-5xl",
        )}
      >
        <Modal.Dialog
          className={cn(
            "rounded-xl border border-outline-variant/30 bg-surface shadow-lg",
            className,
          )}
        >
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="text-on-surface">{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="pt-0">{children}</Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
