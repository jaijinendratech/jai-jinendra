/** Friendly one-line name for an order, built from its items (never the internal code). */
export function orderDisplayTitle(
  items: { name_snapshot: string; qty?: number }[] | null | undefined,
): string {
  const names = (items ?? []).map((i) => i.name_snapshot.split(" · ")[0].trim());
  if (names.length === 0) return "Your order";
  if (names.length === 1) return names[0];
  const more = names.length - 1;
  return `${names[0]} + ${more} more ${more === 1 ? "item" : "items"}`;
}
