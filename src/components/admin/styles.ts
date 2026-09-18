/** Shared Tailwind class helpers — safe for Server and Client Components. */

export function fieldClassName() {
  return "mt-1.5 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none";
}

export function labelClassName() {
  return "block text-sm font-semibold text-on-surface";
}

/** Two-column field grid for admin modal/drawer forms (1-col below `sm`). */
export function adminFieldGridClassName() {
  return "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-3";
}

/** Full-row span inside an admin field grid. */
export function adminFieldFullClassName() {
  return "sm:col-span-2";
}

export function primaryBtnClassName() {
  return "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-container disabled:opacity-60";
}

export function secondaryBtnClassName() {
  return "inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-on-surface-variant hover:border-primary hover:text-primary";
}
