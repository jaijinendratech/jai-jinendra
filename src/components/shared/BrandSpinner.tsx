/**
 * Brand-themed loading spinner: the trefoil logo mark centered inside a
 * rotating ring of fading dots (see the reference design shared by the
 * client). Pure SVG/CSS — no animation library needed. Used both as a
 * small inline indicator inside buttons (`size="sm"`) and as a large
 * full-page overlay (`size="lg"`, see `src/app/loading.tsx`).
 */
const DOT_COUNT = 28;

const SIZE_PX: Record<"sm" | "md" | "lg", number> = {
  sm: 20,
  md: 40,
  lg: 88,
};

function dotStyle(index: number, px: number) {
  const angle = (index / DOT_COUNT) * 360;
  // Four bright arcs with four gaps around the ring, fading at each arc's
  // ends — matches the reference image's comet-trail look.
  const wave = Math.abs(Math.sin((angle * Math.PI) / 180) * Math.cos((angle * Math.PI) / 180) * 2);
  const intensity = Math.max(0.08, wave);
  const dotSize = Math.max(1.5, px * (0.09 + intensity * 0.09));
  // translateY with a px radius (not %, which resolves against the dot's
  // own tiny box, not the parent circle) pushes each dot out to the ring.
  const radius = px * 0.42;
  return {
    transform: `rotate(${angle}deg) translateY(-${radius}px)`,
    width: dotSize,
    height: dotSize,
    marginLeft: -dotSize / 2,
    marginTop: -dotSize / 2,
    opacity: intensity,
  } as const;
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
      <svg
        viewBox="0 0 100 100"
        className="relative"
        style={{ width: `${px * 0.52}px`, height: `${px * 0.52}px` }}
        aria-hidden
      >
        <path
          fill="currentColor"
          className="text-primary"
          d="M50 6 C62 22 70 36 70 48 C70 54 68 59 65 63 C74 65 82 70 88 78 C92 83 94 88 95 93
             L71 93 C66 93 62 91 59 88 L54 83 C52 81 48 81 46 83 L41 88 C38 91 34 93 29 93
             L5 93 C6 88 8 83 12 78 C18 70 26 65 35 63 C32 59 30 54 30 48 C30 36 38 22 50 6 Z
             M50 40 C47 40 45 42 45 45 L45 68 C45 71 47 73 50 73 C53 73 55 71 55 68 L55 45
             C55 42 53 40 50 40 Z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
