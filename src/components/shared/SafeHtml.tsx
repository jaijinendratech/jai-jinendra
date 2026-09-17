import { sanitizeAdminHtml, looksLikeHtml } from "@/lib/sanitize-html";
import { cn } from "@/lib/cn";

export function SafeHtml({
  html,
  className,
  as: Tag = "div",
}: {
  html: string;
  className?: string;
  as?: "div" | "p" | "span";
}) {
  if (!html) return null;

  if (!looksLikeHtml(html)) {
    return <Tag className={className}>{html}</Tag>;
  }

  const clean = sanitizeAdminHtml(html);
  return (
    <Tag
      className={cn("prose prose-sm max-w-none text-inherit", className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
