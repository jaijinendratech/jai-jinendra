"use client";

import { Modal } from "@heroui/react";
import { Copy, X } from "lucide-react";
import { type FormEvent, useState, useSyncExternalStore } from "react";
import { RequiredMark } from "@/components/shared/RequiredMark";

const DISMISS_KEY = "jj-offer-popup-dismissed";
const COUPON_CODE = "FLAT10";

type Listener = () => void;

const listeners = new Set<Listener>();
let closedThisView = false;

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function isOpenInSession() {
  if (closedThisView) return false;
  try {
    return sessionStorage.getItem(DISMISS_KEY) !== "1";
  } catch {
    // sessionStorage can throw in private mode; still show once
    return true;
  }
}

function getServerSnapshot() {
  return false;
}

function rememberDismissed() {
  try {
    sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // sessionStorage is best-effort only.
  }
}

function dismiss() {
  closedThisView = true;
  rememberDismissed();
  listeners.forEach((listener) => listener());
}

export function OfferPopup() {
  const open = useSyncExternalStore(subscribe, isOpenInSession, getServerSnapshot);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [claimed, setClaimed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/offer-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, email }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "Could not claim the offer. Please try again.");
        return;
      }

      rememberDismissed();
      setClaimed(true);
    } catch {
      setError("Could not claim the offer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      setCopied(true);
    } catch {
      setError("Copy failed. Please copy the code manually.");
    }
  }

  return (
    // Controlled open without Modal.Trigger: put isOpen on Backdrop.
    // Wrapping in <Modal state> creates a DialogTrigger with no pressable
    // child and logs React Aria's PressResponder warning.
    <Modal.Backdrop
      isOpen={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
      isDismissable
      variant="blur"
    >
      <Modal.Container placement="center" size="sm">
        <Modal.Dialog className="rounded-2xl border border-outline-variant/40 bg-background p-6 text-on-surface shadow-lg sm:max-w-md">
          <div className="flex items-start justify-between gap-4">
            <Modal.Heading className="font-display text-4xl font-semibold tracking-tight text-primary">
              10% OFF
            </Modal.Heading>
            <Modal.CloseTrigger
              aria-label="Close offer"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-white transition hover:bg-primary-container-hover"
            >
              <X className="h-5 w-5" aria-hidden />
            </Modal.CloseTrigger>
          </div>
          <Modal.Body className="px-0 pt-3 pb-0">
            {claimed ? (
              <div className="space-y-4">
                <p className="text-base leading-6 text-on-surface">
                  Your welcome offer is ready. Use this code at checkout. We have also emailed it to you.
                </p>
                <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Coupon code
                  </p>
                  <p className="mt-2 font-display text-4xl font-semibold tracking-widest text-primary">
                    {COUPON_CODE}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90"
                >
                  <Copy className="h-4 w-4" aria-hidden />
                  {copied ? "Copied" : "Copy code"}
                </button>
                {error ? (
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                ) : null}
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <p className="text-base leading-6 text-on-surface">
                  Share your details and claim 10% off your first order. We will email you the coupon code.
                </p>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-outline">
                    Name
                    <RequiredMark />
                  </span>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    className="mt-1 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="Enter your name"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-outline">
                    Email
                    <RequiredMark />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    className="mt-1 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="you@example.com"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-outline">
                    Mobile number
                    <RequiredMark />
                  </span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    autoComplete="tel"
                    inputMode="tel"
                    className="mt-1 w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="10-digit mobile number"
                    required
                  />
                </label>
                {error ? (
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Claiming..." : "Claim 10% Off"}
                </button>
              </form>
            )}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
