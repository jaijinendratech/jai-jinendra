"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Label,
} from "@heroui/react";
import { BrandSpinner } from "@/components/shared/BrandSpinner";
import { RequiredMark } from "@/components/shared/RequiredMark";
import {
  signInWithEmailAction,
  signInWithGoogleAction,
  signUpWithEmailAction,
} from "@/lib/auth";

type LoginMode = "signin" | "signup";

type LoginFormProps = {
  mode: LoginMode;
  next: string;
  error?: string;
  notice?: string;
};

/** Must live inside the <Form> it reports on — useFormStatus reads the nearest parent form. */
function EmailSubmitButton({
  creating,
  acceptedTerms,
}: {
  creating: boolean;
  acceptedTerms: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="primary"
      isDisabled={pending || !acceptedTerms}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container font-bold text-white hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <BrandSpinner
          size={18}
          label={creating ? "Creating account" : "Signing in"}
        />
      ) : creating ? (
        "Create account"
      ) : (
        "Sign in"
      )}
    </Button>
  );
}

function GoogleSubmitButton({ acceptedTerms }: { acceptedTerms: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="secondary"
      isDisabled={pending || !acceptedTerms}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-outline-variant/60 bg-white py-2.5 font-semibold text-on-surface shadow-sm transition hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <BrandSpinner size={18} label="Connecting to Google" />
      ) : (
        <>
          <Image
            src="/images/g-logo.png"
            alt="Google"
            width={20}
            height={20}
            className="h-5 w-5 object-contain"
          />
          Continue with Google
        </>
      )}
    </Button>
  );
}

function errorMessage(error?: string): string | null {
  switch (error) {
    case "invalid_credentials":
      return "Email or password is incorrect.";
    case "email_registered":
      return "This email is already registered. Sign in instead.";
    case "weak_password":
      return "Password must be at least 8 characters.";
    case "admin_use_admin_login":
      return "Admin accounts must sign in at the admin login page.";
    case "too_many_attempts":
      return "Too many attempts. Please wait and try again.";
    case "google_failed":
      return "Google sign-in could not start. Please try again.";
    case "terms_required":
      return "Please agree to the Terms & Conditions and Privacy Policy to continue.";
    default:
      return null;
  }
}

export function LoginForm({ mode, next, error, notice }: LoginFormProps) {
  const [accountMode, setAccountMode] = useState<LoginMode>(mode);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const message = errorMessage(error);
  const creating = accountMode === "signup";

  if (notice === "confirm_email") {
    return (
      <Card className="w-full max-w-md border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
        <Card.Header className="flex flex-col items-start gap-2 px-8 pt-8">
          <Card.Title className="font-display text-2xl font-semibold text-on-surface">
            Check your email
          </Card.Title>
          <Card.Description className="text-sm text-on-surface-variant">
            Check your email to confirm your account. After you confirm, you
            can sign in and continue.
          </Card.Description>
        </Card.Header>
        <Card.Content className="px-8 pb-8 pt-4">
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
      <Card.Header className="flex flex-col items-start gap-2 px-8 pt-8">
        <Card.Title className="font-display text-2xl font-semibold text-on-surface">
          {creating ? "Create account" : "Sign in"}
        </Card.Title>
        <Card.Description className="text-sm text-on-surface-variant">
          Account required before checkout.
        </Card.Description>
        <div className="mt-2 flex w-full border-b border-outline-variant/30">
          <button
            type="button"
            onClick={() => setAccountMode("signin")}
            className={`flex-1 border-b-2 py-2 text-sm font-semibold ${
              creating
                ? "border-transparent text-on-surface-variant"
                : "border-primary-container text-on-surface"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setAccountMode("signup")}
            className={`flex-1 border-b-2 py-2 text-sm font-semibold ${
              creating
                ? "border-primary-container text-on-surface"
                : "border-transparent text-on-surface-variant"
            }`}
          >
            Create account
          </button>
        </div>
      </Card.Header>

      <Card.Content className="space-y-4 px-8 pb-8 pt-4">
        {message ? (
          <Alert status="danger">
            <Alert.Description>{message}</Alert.Description>
          </Alert>
        ) : null}

        <Form
          action={creating ? signUpWithEmailAction : signInWithEmailAction}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="next" value={next} />
          {creating ? (
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="full_name"
                className="text-sm font-semibold text-on-surface"
              >
                Name (optional)
              </Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                className="w-full"
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-on-surface"
            >
              Email
              <RequiredMark />
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@email.com"
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-on-surface"
            >
              Password
              <RequiredMark />
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={creating ? "new-password" : "current-password"}
              placeholder="At least 8 characters"
              className="w-full"
            />
          </div>
          {acceptedTerms ? (
            <input type="hidden" name="accept_terms" value="on" />
          ) : null}
          <Checkbox
            isSelected={acceptedTerms}
            onChange={setAcceptedTerms}
            isRequired
            className="w-full"
            aria-label="Agree to Terms and Conditions and Privacy Policy"
          >
            <Checkbox.Content className="items-start gap-3">
              <Checkbox.Control className="mt-0.5 size-5 shrink-0 border-2 border-outline-variant bg-white shadow-sm data-[selected=true]:border-primary data-[selected=true]:bg-primary">
                <Checkbox.Indicator />
              </Checkbox.Control>
              <span className="text-xs leading-5 text-on-surface-variant">
                I agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/terms-privacy#privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  Privacy Policy
                </Link>
              </span>
            </Checkbox.Content>
          </Checkbox>
          <EmailSubmitButton creating={creating} acceptedTerms={acceptedTerms} />
        </Form>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-outline-variant/40" />
          <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            or
          </span>
          <span className="h-px flex-1 bg-outline-variant/40" />
        </div>

        <Form action={signInWithGoogleAction}>
          <input type="hidden" name="next" value={next} />
          <GoogleSubmitButton acceptedTerms={acceptedTerms} />
        </Form>

        <p className="text-center text-xs text-on-surface-variant">
          <Link href="/catalogue" className="text-primary hover:underline">
            Continue browsing
          </Link>
          {error === "admin_use_admin_login" ? (
            <>
              {" · "}
              <Link href="/admin/login" className="text-primary hover:underline">
                Admin login
              </Link>
            </>
          ) : null}
        </p>
      </Card.Content>
    </Card>
  );
}
