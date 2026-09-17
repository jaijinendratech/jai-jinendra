"use client";

import { Button, Input } from "@heroui/react";
import { newsletter } from "@/data/home";

export function NewsletterSection() {
  return (
    <section className="border-t border-outline-variant/30 bg-surface-container-lowest py-8 md:py-16">
      <div className="container-jj mx-auto max-w-2xl text-center">
        <span className="label-sm font-bold uppercase tracking-widest text-primary">
          {newsletter.eyebrow}
        </span>
        <h2 className="font-display mt-2 text-2xl font-semibold text-on-surface md:text-3xl">
          <span className="md:hidden">{newsletter.mobileTitle}</span>
          <span className="hidden md:inline">{newsletter.title}</span>
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant md:mt-3 md:text-base">
          <span className="md:hidden">{newsletter.mobileBody}</span>
          <span className="hidden md:inline">{newsletter.body}</span>
        </p>

        <form
          className="mt-5 flex flex-row items-stretch gap-2 md:mt-6 md:gap-3"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <Input
            type="email"
            name="email"
            required
            aria-label="Email address"
            placeholder="Enter your email"
            className="min-w-0 flex-1"
          />
          <Button
            type="submit"
            className="shrink-0 rounded-lg bg-primary-container px-4 text-white md:px-6"
          >
            <span className="md:hidden">{newsletter.mobileCta}</span>
            <span className="hidden md:inline">{newsletter.cta}</span>
          </Button>
        </form>
        <p className="mt-2 text-xs text-on-surface-variant md:mt-3">{newsletter.disclaimer}</p>
      </div>
    </section>
  );
}
