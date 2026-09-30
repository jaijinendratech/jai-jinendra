"use client";

import { Modal, useOverlayState } from "@heroui/react";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISS_KEY = "jj-offer-popup-dismissed";

export function OfferPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // sessionStorage can throw in private mode; still show once
    }
    setOpen(true);
  }, []);

  const state = useOverlayState({
    isOpen: open,
    onOpenChange: (next) => {
      if (!next && open) {
        try {
          sessionStorage.setItem(DISMISS_KEY, "1");
        } catch {
          // still close for this view
        }
      }
      setOpen(next);
    },
  });

  return (
    <Modal state={state}>
      <Modal.Backdrop isDismissable variant="blur">
        <Modal.Container placement="center" size="sm">
          <Modal.Dialog className="rounded-2xl border border-outline-variant/40 bg-background p-6 text-on-surface shadow-lg sm:max-w-md">
            <div className="flex items-start justify-between gap-4">
              <Modal.Heading className="font-display text-4xl font-semibold tracking-tight text-primary">
                10% OFF
              </Modal.Heading>
              <button
                type="button"
                aria-label="Close offer"
                onClick={() => state.close()}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-white transition hover:bg-primary-container-hover"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <Modal.Body className="px-0 pt-3 pb-0">
              <p className="text-base leading-6 text-on-surface">
                A festive welcome while you browse.
              </p>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
