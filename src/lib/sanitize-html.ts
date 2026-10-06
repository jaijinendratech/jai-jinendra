import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "mark",
  "span",
  "h2",
  "h3",
  "blockquote",
];

/** Server-safe HTML allowlist. Does not use jsdom (that crashes on Vercel Node). */
export function sanitizeAdminHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      "*": ["class"],
    },
  });
}

export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

/** Strip admin rich-text HTML for one-line previews (cards, search blurbs). */
export function htmlToPlainText(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";
  if (!looksLikeHtml(trimmed)) return trimmed;
  const withoutTags = sanitizeHtml(trimmed, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return withoutTags.replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}
