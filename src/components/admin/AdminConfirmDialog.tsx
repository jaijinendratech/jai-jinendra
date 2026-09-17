"use client";

import { AlertDialog, Button } from "@heroui/react";

export type AdminConfirmDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  danger?: boolean;
};

/**
 * Controlled confirm dialog for admin destructive actions.
 * Uses HeroUI AlertDialog (Escape / backdrop dismiss = cancel).
 */
export function AdminConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  danger = true,
}: AdminConfirmDialogProps) {
  return (
    <AlertDialog.Backdrop
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      variant="blur"
    >
      <AlertDialog.Container>
        <AlertDialog.Dialog className="rounded-xl border border-outline-variant/30 bg-surface sm:max-w-[400px]">
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Icon status={danger ? "danger" : "accent"} />
            <AlertDialog.Heading className="text-on-surface">
              {title}
            </AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p className="text-sm text-on-surface-variant">{message}</p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button slot="close" variant="secondary" className="min-w-20">
              {cancelLabel}
            </Button>
            <Button
              variant={danger ? "danger" : "primary"}
              className="min-w-20"
              onPress={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
