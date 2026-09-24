"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { celebrationBanner } from "@/data/home";
import type { SpecialAttentionCategory } from "@/lib/catalog/queries";

function SpecialCtaCarousel({
  items,
}: {
  items: SpecialAttentionCategory[];
}) {
  const [index, setIndex] = useState(0);
  const count = items.length;

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || count <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [count]);

  const active = items[index];
  if (!active) return null;

  return (
    <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:items-start">
      <div className="relative w-full min-h-11 sm:min-w-50 md:min-h-12">
        {items.map((item, i) => (
          <Link
            key={item.id}
            href={item.href}
            tabIndex={i === index ? 0 : -1}
            aria-hidden={i !== index}
            className={`inline-flex w-full min-w-0 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-[opacity,transform] duration-500 hover:bg-primary-fixed sm:w-auto sm:min-w-50 md:px-6 md:py-3 ${
              i === index
                ? "relative z-10 opacity-100"
                : "pointer-events-none absolute inset-0 z-0 opacity-0"
            }`}
          >
            Shop {item.title}
          </Link>
        ))}
      </div>
      {count > 1 ? (
        <div className="flex items-center gap-2" role="tablist" aria-label="Special categories">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Shop ${item.title}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/45 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CelebrationBanner({
  specialAttention = [],
}: {
  specialAttention?: SpecialAttentionCategory[];
}) {
  const hasSpecial = specialAttention.length > 0;

  return (
    <section
      id="hampers"
      className="relative overflow-hidden border-y border-primary-container bg-cover bg-center py-10 text-white md:py-24"
      style={{ backgroundImage: `url("${celebrationBanner.backgroundImage}")` }}
    >
      <div className="absolute inset-0 bg-primary/75" />
      <div className="container-jj relative z-10 max-w-3xl text-center md:text-left">
        {hasSpecial ? (
          <span className="label-sm inline-flex items-center gap-1.5 uppercase tracking-widest text-primary-fixed">
            Special attention
          </span>
        ) : (
          <span className="label-sm uppercase tracking-widest text-primary-fixed">
            {celebrationBanner.eyebrow}
          </span>
        )}
        <h2 className="font-display mt-2 text-2xl font-semibold leading-tight md:mt-3 md:text-5xl">
          <span className="md:hidden">{celebrationBanner.mobileTitle}</span>
          <span className="hidden md:inline">{celebrationBanner.title}</span>
        </h2>
        <p className="mt-2 text-sm leading-6 text-primary-fixed md:mt-4 md:leading-7 md:text-base">
          <span className="md:hidden">{celebrationBanner.mobileBody}</span>
          <span className="hidden md:inline">{celebrationBanner.body}</span>
        </p>
        <div className="mt-5 flex flex-col items-center gap-2.5 sm:flex-row md:mt-8 md:items-start md:gap-3">
          {hasSpecial ? (
            <SpecialCtaCarousel items={specialAttention} />
          ) : (
            <Link
              href={celebrationBanner.primaryCta.href}
              className="inline-flex w-full min-w-0 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary-fixed sm:w-auto sm:min-w-50 md:px-6 md:py-3"
            >
              <span className="md:hidden">
                {celebrationBanner.primaryCta.mobileLabel}
              </span>
              <span className="hidden md:inline">
                {celebrationBanner.primaryCta.label}
              </span>
            </Link>
          )}
          <Link
            href={celebrationBanner.secondaryCta.href}
            className="hidden min-w-50 items-center justify-center rounded-lg border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:inline-flex"
          >
            {celebrationBanner.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
