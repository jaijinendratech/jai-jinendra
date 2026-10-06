import type { CSSProperties } from "react";

/**
 * Brand-themed inline spinner: the trefoil logo mark centered inside a
 * rotating ring of fading dots. Pure SVG/CSS, no animation library needed.
 * For buttons and small indicators only. Route-level loading uses BrandLoader.
 */
const DOT_COUNT = 28;

const SIZE_PX: Record<"sm" | "md" | "lg", number> = {
  sm: 20,
  md: 40,
  lg: 88,
};

/** Stable CSS literals so SSR HTML matches the hydrated client (no float drift). */
function cssNum(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

function dotStyle(index: number, px: number): CSSProperties {
  const angle = (index / DOT_COUNT) * 360;
  // Four bright arcs with four gaps around the ring, fading at each arc's
  // ends, matches the reference image's comet-trail look.
  const wave = Math.abs(
    Math.sin((angle * Math.PI) / 180) * Math.cos((angle * Math.PI) / 180) * 2,
  );
  const intensity = Math.max(0.08, wave);
  const dotSize = Math.max(1.5, px * (0.09 + intensity * 0.09));
  // translateY with a px radius (not %, which resolves against the dot's
  // own tiny box, not the parent circle) pushes each dot out to the ring.
  const radius = px * 0.42;
  const size = `${cssNum(dotSize)}px`;
  const inset = `${cssNum(-dotSize / 2)}px`;
  return {
    transform: `rotate(${cssNum(angle)}deg) translateY(-${cssNum(radius)}px)`,
    width: size,
    height: size,
    marginLeft: inset,
    marginTop: inset,
    opacity: Number(cssNum(intensity)),
  };
}

export function BrandSpinner({
  size = "md",
  label = "Loading",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | number;
  label?: string;
  className?: string;
}) {
  const px = typeof size === "number" ? size : SIZE_PX[size];

  return (
    <span
      role="status"
      aria-label={label}
      className={`brand-spinner relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: px, height: px }}
    >
      <span className="brand-spinner-ring absolute inset-0">
        {Array.from({ length: DOT_COUNT }, (_, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full bg-primary"
            style={dotStyle(i, px)}
          />
        ))}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- small decorative mark, any size */}
      <img
        src="/brand/loader-mark.png"
        alt=""
        aria-hidden
        className="relative object-contain"
        style={{
          width: `${cssNum(px * 0.52)}px`,
          height: `${cssNum(px * 0.52)}px`,
        }}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
