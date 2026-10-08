const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email or password is incorrect.",
  email_registered: "This email is already registered. Sign in instead.",
  weak_password: "Password must be at least 8 characters.",
  admin_use_admin_login: "Admin accounts must sign in at the admin login page.",
  too_many_attempts: "Too many attempts. Please wait and try again.",
  google_failed: "Google sign-in could not start. Please try again.",
  terms_required:
    "Please agree to the Terms & Conditions and Privacy Policy to continue.",
  invalid_otp: "That code is incorrect or has expired. Please try again.",
  otp_failed: "We could not send the code. Please try again.",
  invalid_phone: "Please enter a valid phone number.",
  unauthorized: "You don't have access to that page.",
};

/** Friendly copy for a known auth error code, or null when unknown. */
export function authErrorMessage(code?: string | null): string | null {
  return code ? (AUTH_ERROR_MESSAGES[code] ?? null) : null;
}
