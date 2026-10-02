const BAKERY_MARKS = ["100% Eggless", "100% Vegetarian"] as const;

/** Dietary marks for the Bakery hero and the All-page Bakery block. */
export function BakeryDietaryMarks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
      {BAKERY_MARKS.map((label) => (
        <span key={label} className="inline-flex items-center gap-2">
          <span className="veg-mark" aria-hidden>
            <span className="veg-mark-dot" />
          </span>
          <span className="label-sm uppercase tracking-widest text-on-surface">
            {label}
          </span>
        </span>
      ))}
    </div>
  );
}
