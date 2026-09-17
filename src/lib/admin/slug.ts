export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function suggestTagline(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return `Handcrafted ${trimmed} — fresh from our kitchen.`;
}
