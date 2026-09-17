"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { ExperienceSlide } from "@/data/experience-pages";

export function PageHeroCarousel({
  slides,
  label,
  showNavButtons = true,
  compactMobile = false,
}: {
  slides: readonly ExperienceSlide[];
  label: string;
  /** When false, hides prev/next arrows (dots and auto-advance remain). */
  showNavButtons?: boolean;
  /** Tighter mobile aspect + shorter overlay copy. */
  compactMobile?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const headingId = useId();
  const count = slides.length;

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || count <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [count]);

  function go(delta: number) {
    setIndex((current) => (current + delta + count) % count);
  }

  const active = slides[index];

  return (
    <section
      className="w-full bg-surface py-3 md:py-6"
      aria-roledescription="carousel"
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="sr-only">
        {label}
      </h2>

      <div className="relative mx-auto w-[95%] overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_10px_24px_-4px_rgba(136,19,55,0.06)]">
        <div
          className={`relative w-full ${
            compactMobile
              ? "aspect-16/10 min-h-44 md:aspect-21/9 md:min-h-72 lg:min-h-90"
              : "aspect-16/10 min-h-48 md:aspect-21/9 md:min-h-72 lg:min-h-90"
          }`}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
                i === index ? "z-10 opacity-100" : "z-0 opacity-0"
              }`}
              aria-hidden={i !== index}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="95vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-linear-to-r from-on-surface/70 via-on-surface/35 to-transparent" />
            </div>
          ))}

          {active ? (
            <div className="absolute inset-y-0 left-0 z-20 flex max-w-xl flex-col justify-end p-4 text-white md:justify-center md:p-10 lg:p-12">
              {active.eyebrow ? (
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-fixed md:text-xs">
                  {active.eyebrow}
                </p>
              ) : null}
              {active.title ? (
                <p className="font-display mt-1.5 text-xl font-semibold leading-tight md:mt-2 md:text-4xl lg:text-5xl">
                  {active.title}
                </p>
              ) : null}
              {active.subtitle ? (
                <p className="mt-1.5 max-w-md text-xs leading-snug text-white/90 line-clamp-2 md:mt-2 md:line-clamp-none md:text-base md:leading-relaxed">
                  {active.subtitle}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {count > 1 ? (
          <>
            {showNavButtons ? (
              <>
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={() => go(-1)}
                  className="absolute top-1/2 left-2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-on-surface/40 text-white backdrop-blur-sm transition hover:bg-primary-container md:left-4 md:flex"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={() => go(1)}
                  className="absolute top-1/2 right-2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-on-surface/40 text-white backdrop-blur-sm transition hover:bg-primary-container md:right-4 md:flex"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </>
            ) : null}

            <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-lowest/85 px-3 py-1.5 shadow-sm backdrop-blur-md md:bottom-4">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show slide ${i + 1}: ${slide.title ?? slide.alt}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                    i === index
                      ? "w-7 bg-primary"
                      : "w-2 bg-outline-variant/60 hover:bg-primary/50"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
