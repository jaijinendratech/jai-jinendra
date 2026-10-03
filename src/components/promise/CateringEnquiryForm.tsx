"use client";

import { useState, type FormEvent } from "react";
import { toast } from "@heroui/react";
import { RequiredMark } from "@/components/shared/RequiredMark";
import { siteConfig } from "@/data/home";

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none";

/**
 * Catering enquiry. Stored as a `corporate` enquiry with `kind: "catering"`
 * (the enquiry_type enum has no catering value).
 */
export function CateringEnquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSending(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "corporate",
          payload: {
            kind: "catering",
            name: String(data.get("name") ?? ""),
            email: String(data.get("email") ?? ""),
            phone: String(data.get("phone") ?? ""),
            eventDate: String(data.get("eventDate") ?? ""),
            guests: String(data.get("guests") ?? ""),
            city: String(data.get("city") ?? ""),
            message: String(data.get("notes") ?? ""),
          },
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Could not send enquiry");
      setSubmitted(true);
      toast.success("Enquiry sent", {
        description: "We'll get back within one business day.",
      });
    } catch (err) {
      toast.danger(
        err instanceof Error ? err.message : "Could not send enquiry",
      );
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-secondary/30 bg-secondary-container/30 p-6">
        <h3 className="font-display text-xl font-semibold text-on-surface">
          Enquiry received
        </h3>
        <p className="mt-2 text-sm text-on-surface-variant">
          Our catering team will respond within one business day at{" "}
          {siteConfig.email}. For urgent events, call {siteConfig.phone}.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="space-y-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
    >
      <div>
        <h3 className="font-display text-xl font-semibold text-on-surface">
          Request a catering quote
        </h3>
        <p className="mt-1 text-xs text-on-surface-variant">
          Tell us the occasion, date, guest count, and city — we will propose a menu and quantities.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-on-surface">
          Full name
          <RequiredMark />
          <input required name="name" placeholder="Your name" className={fieldClassName} />
        </label>
        <label className="block text-sm font-semibold text-on-surface">
          Email
          <RequiredMark />
          <input
            required
            name="email"
            type="email"
            placeholder="you@example.com"
            className={fieldClassName}
          />
        </label>
        <label className="block text-sm font-semibold text-on-surface">
          Phone
          <RequiredMark />
          <input required name="phone" type="tel" placeholder="+91" className={fieldClassName} />
        </label>
        <label className="block text-sm font-semibold text-on-surface">
          Event date
          <RequiredMark />
          <input required name="eventDate" type="date" className={fieldClassName} />
        </label>
        <label className="block text-sm font-semibold text-on-surface">
          Approx. guests
          <RequiredMark />
          <input
            required
            name="guests"
            type="number"
            min={1}
            placeholder="e.g. 150"
            className={fieldClassName}
          />
        </label>
        <label className="block text-sm font-semibold text-on-surface">
          Event city
          <RequiredMark />
          <input required name="city" placeholder="City" className={fieldClassName} />
        </label>
      </div>
      <label className="block text-sm font-semibold text-on-surface">
        Event details
        <RequiredMark />
        <textarea
          name="notes"
          rows={4}
          required
          placeholder="Wedding, puja, office party… sweets/namkeen preferences, timings"
          className="mt-1.5 w-full rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-3 text-sm text-on-surface focus:border-primary focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary disabled:opacity-60 sm:w-auto"
      >
        {sending ? "Sending…" : "Submit enquiry"}
      </button>
    </form>
  );
}
