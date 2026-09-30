export function parseAttributeOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (typeof item === "string" && item.trim()) return [item.trim()];
    if (item && typeof item === "object") {
      const record = item as { value?: unknown; label?: unknown };
      if (typeof record.value === "string" && record.value.trim()) {
        return [record.value.trim()];
      }
      if (typeof record.label === "string" && record.label.trim()) {
        return [record.label.trim()];
      }
    }
    return [];
  });
}
