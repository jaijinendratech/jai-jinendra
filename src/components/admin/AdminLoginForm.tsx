"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { BrandSpinner } from "@/components/shared/BrandSpinner";
import { RequiredMark } from "@/components/shared/RequiredMark";

/** Must live inside the <form> it reports on, useFormStatus reads the nearest parent form. */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <BrandSpinner size={18} label="Signing in" /> : "Sign in"}
    </button>
  );
}

export function AdminLoginForm({
  action,
  next,
  defaultEmail,
}: {
  action: (formData: FormData) => void | Promise<void>;
  next: string;
  defaultEmail: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm font-semibold text-on-surface">
        Email
        <RequiredMark />
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          className="mt-1.5 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
        />
      </label>
      <label className="block text-sm font-semibold text-on-surface">
        Password
        <RequiredMark />
        <div className="relative mt-1.5">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-outline-variant/50 py-2.5 pl-3 pr-11 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </label>
      <SubmitButton />
    </form>
  );
}
