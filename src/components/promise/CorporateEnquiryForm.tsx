"use client";

import { useState, type FormEvent } from "react";
import { siteConfig } from "@/data/home";

export function CorporateEnquiryForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-secondary/30 bg-secondary-container/30 p-6">
        <h3 className="font-display text-xl font-semibold text-on-surface">
          Enquiry received
        </h3>
        <p className="mt-2 text-sm text-on-surface-variant">
          Our corporate desk will respond within one business day at{" "}
          {siteConfig.email}. For urgent festive programmes, call{" "}
          {siteConfig.phone}.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
    >
      <div>
        <h3 className="font-display text-xl font-semibold text-on-surface">
          Request a corporate quote
        </h3>
        <p className="mt-1 text-xs text-on-surface-variant">
          Tell us volume, cities, and branding needs — we will propose hamper mixes and timelines.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-on-surface">
          Full name
          <input
            required
            name="name"
            placeholder="Your name"
            className="mt-1.5 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block text-sm font-semibold text-on-surface">
          Work email
          <input
            required
            name="email"
            type="email"
            placeholder="you@company.com"
            className="mt-1.5 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block text-sm font-semibold text-on-surface">
          Phone
          <input
            required
            name="phone"
            type="tel"
            placeholder="+91"
            className="mt-1.5 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block text-sm font-semibold text-on-surface">
          Company
          <input
            required
            name="company"
            placeholder="Organisation name"
            className="mt-1.5 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block text-sm font-semibold text-on-surface sm:col-span-2">
          Approx. quantity
          <input
            required
            name="quantity"
            type="number"
            min={25}
            placeholder="e.g. 100"
            className="mt-1.5 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
      </div>
      <label className="block text-sm font-semibold text-on-surface">
        Programme notes
        <textarea
          name="notes"
          rows={4}
          required
          placeholder="Diwali client gifts, delivery cities, logo requirements…"
          className="mt-1.5 w-full rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-3 text-sm text-on-surface focus:border-primary focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary sm:w-auto"
      >
        Submit enquiry
      </button>
    </form>
  );
}
