/** Shared Tailwind class helpers — safe for Server and Client Components. */

export function fieldClassName() {
  return "mt-1.5 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none";
}

export function labelClassName() {
  return "block text-sm font-semibold text-on-surface";
}

export function primaryBtnClassName() {
  return "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-container disabled:opacity-60";
}

export function secondaryBtnClassName() {
  return "inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-on-surface-variant hover:border-primary hover:text-primary";
}
