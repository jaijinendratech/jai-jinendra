import Link from "next/link";

export type CategoryPill = {
  key: string;
  label: string;
  href: string;
  active?: boolean;
  tone?: "default" | "action";
};

const PRESERVED_PARAMS = ["purity", "spice", "price"] as const;

export function hrefWithSub(
  pathname: string,
  searchParams: Record<string, string | string[] | undefined>,
  sub: string | null,
): string {
  const params = new URLSearchParams();
  for (const key of PRESERVED_PARAMS) {
    const raw = searchParams[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) params.set(key, value);
  }
  if (sub) params.set("sub", sub);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function CategoryPillRow({
  label,
  pills,
  className = "",
}: {
  label: string;
  pills: CategoryPill[];
  className?: string;
}) {
  if (pills.length === 0) return null;

  return (
    <nav
      aria-label={label}
      className={`-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {pills.map((pill) => (
        <Link
          key={pill.key}
          href={pill.href}
          aria-current={pill.active ? "page" : undefined}
          className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold transition md:px-4 md:py-2 ${
            pill.active
              ? "bg-primary text-white shadow-sm"
              : pill.tone === "action"
                ? "border border-primary bg-surface-container-lowest text-primary hover:bg-primary hover:text-white"
                : "border border-outline-variant/50 bg-surface-container-lowest text-on-surface hover:border-primary hover:text-primary"
          }`}
        >
          {pill.label}
        </Link>
      ))}
    </nav>
  );
}
