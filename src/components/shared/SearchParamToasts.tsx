"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "@heroui/react";
import { authErrorMessage } from "@/lib/auth-messages";

/** "some_code-name" -> "Some code name" so raw codes never reach the user. */
function humanize(code: string): string {
  const text = code.replace(/[-_]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function messageForNotice(notice: string): string {
  if (notice === "saved") return "Changes saved.";
  if (notice === "supabase-required")
    return "Connect Supabase to persist changes.";
  if (notice === "deleted") return "Deleted successfully.";
  if (notice === "admin_customer_required")
    return "You're logged in as admin. Please sign out and log in as a customer to complete your purchase.";
  return humanize(notice);
}

function isWarningNotice(notice: string): boolean {
  return notice === "supabase-required" || notice === "admin_customer_required";
}

function messageForError(error: string): string {
  if (error === "has-products")
    return "Cannot delete a category that still has products.";
  if (error === "1") return "Something went wrong.";
  return authErrorMessage(error) ?? humanize(error);
}

/**
 * Turns `?notice=` / `?error=` query params into HeroUI toasts, then cleans the URL.
 */
export function SearchParamToasts() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const seen = useRef<string | null>(null);

  useEffect(() => {
    const notice = searchParams.get("notice");
    const error = searchParams.get("error");
    if (!notice && !error) return;
    // Shown as a modal by LoginForm, which needs the param to stay in the URL.
    if (notice === "confirm_email" && !error) return;

    const key = `${pathname}?${notice ?? ""}|${error ?? ""}`;
    if (seen.current === key) return;
    seen.current = key;

    if (error) toast.danger(messageForError(error));
    else if (notice) {
      if (isWarningNotice(notice)) toast.warning(messageForNotice(notice));
      else toast.success(messageForNotice(notice));
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete("notice");
    next.delete("error");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  return null;
}
