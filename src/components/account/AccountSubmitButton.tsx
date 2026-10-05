"use client";

import { useFormStatus } from "react-dom";
import { BrandSpinner } from "@/components/shared/BrandSpinner";
import { cn } from "@/lib/cn";

/**
 * Must be rendered inside the form it reports on — useFormStatus reads the
 * nearest parent <form>.
 */
export function AccountSubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {pending ? (
        <>
          <BrandSpinner size={16} label={pendingLabel} />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
