"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  HERO_BANNER_FRAME_CLASS,
  HERO_BANNER_IMAGE_CLASS,
} from "@/lib/hero-banner";

export type HeroCarouselSlide = {
  id: string;
  src: string;
  alt: string;
};

export function HeroCarousel({ slides }: { slides: HeroCarouselSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || count <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [count]);

  if (!count) return null;

  return (
    <section
      id="hero-carousel-section"
      className="relative w-full overflow-hidden border-b border-outline-variant/30 bg-surface"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      <div className={HERO_BANNER_FRAME_CLASS}>
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
              sizes="100vw"
              className={HERO_BANNER_IMAGE_CLASS}
            />
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-lowest/80 px-3 py-1.5 shadow-sm backdrop-blur-md md:bottom-4">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show slide ${i + 1}`}
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
      ) : null}
    </section>
  );
}
