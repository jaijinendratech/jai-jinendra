"use server";

import { createHash } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/env";
import {
  ADMIN_EMAIL,
  ADMIN_SESSION_COOKIE,
  verifyAdminCredentials,
} from "@/lib/admin-config";
import {
  safeAdminRedirectPath,
  safeRedirectPath,
} from "@/lib/safe-redirect";
import type { UserRole } from "@/types/database";
import { getFixedOtp, isFixedOtpEnabled } from "@/lib/auth-config";

function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return trimmed.replace(/[^\d+]/g, "");
  return `+91${trimmed.replace(/\D/g, "")}`;
}

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function otpLoginPassword(phone: string): string {
  const secret =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.AUTH_FIXED_OTP ??
    "dev-otp";
  return createHash("sha256")
    .update(`jj-otp-login:${phone}:${secret}`)
    .digest("hex")
    .slice(0, 48);
}

export async function getSessionUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

export async function getProfileRole(
  userId: string,
): Promise<UserRole | null> {
  const profile = await getProfile(userId);
  return (profile?.role as UserRole | undefined) ?? null;
}

export async function isAdminUser(userId: string): Promise<boolean> {
  return (await getProfileRole(userId)) === "admin";
}

export async function isCustomerUser(userId: string): Promise<boolean> {
  return (await getProfileRole(userId)) === "customer";
}

export async function requireUser(redirectTo = "/login") {
  const user = await getSessionUser();
  if (!user) redirect(redirectTo);
  return user;
}

/** Customer-only gate for storefront account/checkout. */
export async function requireCustomer(redirectTo = "/login") {
  const user = await requireUser(redirectTo);
  const role = await getProfileRole(user.id);
  if (role === "admin") redirect("/cart?notice=admin_customer_required");
  if (role !== "customer") {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect(redirectTo);
  }
  return user;
}

/** API helper: logged-in customer, or null. */
export async function getCustomerSessionUser() {
  const user = await getSessionUser();
  if (!user) return null;
  if (!(await isCustomerUser(user.id))) return null;
  return user;
}

/**
 * Fail closed: cookie demo admin only when Supabase is NOT configured.
 * When Supabase is configured, require a real admin-role session.
 */
export async function requireAdmin() {
  if (isSupabaseConfigured()) {
    const user = await requireUser("/admin/login");
    const admin = await isAdminUser(user.id);
    if (!admin) redirect("/admin/login?error=unauthorized");
    return user;
  }

  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value === "1") {
    return { id: "dev-admin", email: ADMIN_EMAIL };
  }
  redirect("/admin/login?error=1");
}

async function findProfileByPhone(phone: string) {
  const admin = createAdminClient();
  const digits = phoneDigits(phone);
  const variants = Array.from(
    new Set([digits, phone, `+${digits}`, normalizedOrPlus(digits)]),
  );

  const { data } = await admin
    .from("profiles")
    .select("id, role, phone, email")
    .in("phone", variants)
    .limit(1);

  return data?.[0] ?? null;
}

function normalizedOrPlus(digits: string): string {
  return digits.startsWith("91") ? `+${digits}` : `+91${digits}`;
}

async function ensureCustomerAuthUser(phone: string): Promise<
  { ok: true; userId: string } | { ok: false; reason: "admin" | "failed" }
> {
  const admin = createAdminClient();
  const normalized = normalizePhone(phone);
  const digits = phoneDigits(normalized);
  const password = otpLoginPassword(normalized);
  const syntheticEmail = `${digits}@phone.customers.local`;

  const existing = await findProfileByPhone(normalized);
  if (existing?.role === "admin") {
    return { ok: false, reason: "admin" };
  }

  if (existing) {
    const { data: authUser } = await admin.auth.admin.getUserById(existing.id);
    const updates: {
      password: string;
      phone: string;
      phone_confirm: boolean;
      email?: string;
      email_confirm?: boolean;
    } = {
      password,
      phone: normalized,
      phone_confirm: true,
    };
    if (!authUser.user?.email) {
      updates.email = syntheticEmail;
      updates.email_confirm = true;
    }
    const { error } = await admin.auth.admin.updateUserById(
      existing.id,
      updates,
    );
    if (error) return { ok: false, reason: "failed" };
    return { ok: true, userId: existing.id };
  }

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      phone: normalized,
      email: syntheticEmail,
      password,
      phone_confirm: true,
      email_confirm: true,
    });

  if (createError || !created.user) {
    // Race: auth user may exist without matching profile phone formats
    const { data: listed } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const match = listed?.users?.find(
      (u) => phoneDigits(u.phone ?? "") === digits,
    );
    if (!match) return { ok: false, reason: "failed" };

    const { data: profile } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", match.id)
      .maybeSingle();

    if (profile?.role === "admin") return { ok: false, reason: "admin" };

    if (!profile) {
      const { error: insertError } = await admin.from("profiles").insert({
        id: match.id,
        phone: digits,
        email: match.email ?? syntheticEmail,
        role: "customer",
      });
      if (insertError) return { ok: false, reason: "failed" };
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(
      match.id,
      {
        password,
        phone: normalized,
        phone_confirm: true,
      },
    );
    if (updateError) return { ok: false, reason: "failed" };
    return { ok: true, userId: match.id };
  }

  // Trigger creates profile as customer; normalize phone digits on profile
  await admin
    .from("profiles")
    .update({ phone: digits, email: syntheticEmail })
    .eq("id", created.user.id);

  return { ok: true, userId: created.user.id };
}

async function mintCustomerSession(phone: string, userId: string) {
  const admin = createAdminClient();
  const normalized = normalizePhone(phone);
  const password = otpLoginPassword(normalized);
  const supabase = await createClient();

  const { data } = await admin.auth.admin.getUserById(userId);
  const email = data.user?.email;

  // Hosted projects often disable phone+password; prefer email when present.
  if (email) {
    const { error: emailSignInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!emailSignInError) return true;
  }

  const { error: phoneSignInError } = await supabase.auth.signInWithPassword({
    phone: normalized,
    password,
  });
  return !phoneSignInError;
}

async function rejectIfNotCustomer(userId: string, next: string, phone: string) {
  const role = await getProfileRole(userId);
  if (role === "admin") {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect(
      `/login?error=admin_use_admin_login&next=${encodeURIComponent(next)}`,
    );
  }
  if (role !== "customer") {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect(
      `/login?step=verify&error=invalid_otp&phone=${encodeURIComponent(phone)}&next=${encodeURIComponent(next)}`,
    );
  }
}

export async function sendPhoneOtpAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=otp_failed");
  }
  const phone = String(formData.get("phone") ?? "").trim();
  const next = safeRedirectPath(
    String(formData.get("next") ?? "/account"),
    "/account",
  );

  if (!phone.match(/^\+?[0-9]{10,15}$/)) {
    redirect(`/login?error=invalid_phone&next=${encodeURIComponent(next)}`);
  }

  const normalized = normalizePhone(phone);

  const { rateLimit } = await import("@/lib/rate-limit");
  const limited = await rateLimit({
    key: `otp:${normalized}`,
    limit: 5,
    windowMs: 15 * 60_000,
  });
  if (!limited.success) {
    redirect(
      `/login?error=otp_failed&phone=${encodeURIComponent(normalized)}&next=${encodeURIComponent(next)}`,
    );
  }

  // Fixed OTP mode: skip SMS provider entirely
  if (isFixedOtpEnabled()) {
    redirect(
      `/login?step=verify&phone=${encodeURIComponent(normalized)}&next=${encodeURIComponent(next)}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ phone: normalized });

  if (error) {
    redirect(
      `/login?error=otp_failed&phone=${encodeURIComponent(normalized)}&next=${encodeURIComponent(next)}`,
    );
  }

  redirect(
    `/login?step=verify&phone=${encodeURIComponent(normalized)}&next=${encodeURIComponent(next)}`,
  );
}

export async function verifyPhoneOtpAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=invalid_otp");
  }
  const phone = String(formData.get("phone") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  const next = safeRedirectPath(
    String(formData.get("next") ?? "/account"),
    "/account",
  );
  const normalized = normalizePhone(phone);
  const fixedOtp = getFixedOtp();

  if (fixedOtp) {
    if (token !== fixedOtp) {
      redirect(
        `/login?step=verify&error=invalid_otp&phone=${encodeURIComponent(normalized)}&next=${encodeURIComponent(next)}`,
      );
    }

    const ensured = await ensureCustomerAuthUser(normalized);
    if (!ensured.ok) {
      if (ensured.reason === "admin") {
        redirect(
          `/login?error=admin_use_admin_login&next=${encodeURIComponent(next)}`,
        );
      }
      redirect(
        `/login?step=verify&error=invalid_otp&phone=${encodeURIComponent(normalized)}&next=${encodeURIComponent(next)}`,
      );
    }

    const minted = await mintCustomerSession(normalized, ensured.userId);
    if (!minted) {
      redirect(
        `/login?step=verify&error=invalid_otp&phone=${encodeURIComponent(normalized)}&next=${encodeURIComponent(next)}`,
      );
    }

    await rejectIfNotCustomer(ensured.userId, next, normalized);
    redirect(next);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone: normalized,
    token,
    type: "sms",
  });

  if (error || !data.user) {
    redirect(
      `/login?step=verify&error=invalid_otp&phone=${encodeURIComponent(normalized)}&next=${encodeURIComponent(next)}`,
    );
  }

  await rejectIfNotCustomer(data.user.id, next, normalized);
  redirect(next);
}

async function authRedirectOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const headerList = await headers();
  const origin = headerList.get("origin")?.trim().replace(/\/$/, "");
  if (origin) return origin;

  return getSiteUrl().replace(/\/$/, "");
}

function customerLoginPath(params: {
  next: string;
  mode?: "signin" | "signup";
  error?: string;
  notice?: string;
  email?: string;
}): string {
  const search = new URLSearchParams();
  if (params.mode === "signup") search.set("mode", "signup");
  if (params.error) search.set("error", params.error);
  if (params.notice) search.set("notice", params.notice);
  if (params.email) search.set("email", params.email);
  search.set("next", params.next);
  return `/login?${search.toString()}`;
}

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hasAcceptedTerms(formData: FormData): boolean {
  return formData.get("accept_terms") === "on";
}

function authErrorKind(error: {
  message: string;
  code?: string | null;
}):
  | "email_registered"
  | "weak_password"
  | "invalid_credentials"
  | "too_many_attempts"
  | "confirm_email"
  | "other" {
  const code = error.code ?? "";
  const message = error.message.toLowerCase();
  if (
    code === "email_exists" ||
    code === "user_already_exists" ||
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("user already exists")
  ) {
    return "email_registered";
  }
  if (
    code === "weak_password" ||
    (message.includes("password") &&
      (message.includes("at least") || message.includes("weak")))
  ) {
    return "weak_password";
  }
  if (code === "invalid_credentials" || message.includes("invalid login")) {
    return "invalid_credentials";
  }
  if (
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit"
  ) {
    return "too_many_attempts";
  }
  if (code === "email_not_confirmed") return "confirm_email";
  return "other";
}

async function limitAuthAttempt(key: string, failPath: string) {
  const { rateLimit } = await import("@/lib/rate-limit");
  const limited = await rateLimit({
    key,
    limit: 8,
    windowMs: 15 * 60_000,
  });
  if (!limited.success) redirect(failPath);
}

async function rejectAdminCustomerSession(userId: string, next: string) {
  const role = await getProfileRole(userId);
  if (role === "admin") {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect(
      customerLoginPath({ next, error: "admin_use_admin_login" }),
    );
  }
}

export async function signInWithEmailAction(formData: FormData) {
  const next = safeRedirectPath(
    String(formData.get("next") ?? "/account"),
    "/account",
  );
  if (!hasAcceptedTerms(formData)) {
    redirect(customerLoginPath({ next, error: "terms_required" }));
  }
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!isSupabaseConfigured() || !isValidEmail(email) || !password) {
    redirect(customerLoginPath({ next, error: "invalid_credentials" }));
  }

  await limitAuthAttempt(
    `email-login:${email}`,
    customerLoginPath({ next, error: "too_many_attempts" }),
  );

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    if (error && authErrorKind(error) === "confirm_email") {
      redirect(customerLoginPath({ next, notice: "confirm_email", email }));
    }
    redirect(customerLoginPath({ next, error: "invalid_credentials" }));
  }

  await rejectAdminCustomerSession(data.user.id, next);
  redirect(next);
}

export async function signUpWithEmailAction(formData: FormData) {
  const next = safeRedirectPath(
    String(formData.get("next") ?? "/account"),
    "/account",
  );
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!hasAcceptedTerms(formData)) {
    redirect(
      customerLoginPath({ next, mode: "signup", error: "terms_required" }),
    );
  }

  if (!isSupabaseConfigured() || !isValidEmail(email)) {
    redirect(
      customerLoginPath({ next, mode: "signup", error: "invalid_credentials" }),
    );
  }

  if (password.length < 8) {
    redirect(
      customerLoginPath({ next, mode: "signup", error: "weak_password" }),
    );
  }

  await limitAuthAttempt(
    `email-signup:${email}`,
    customerLoginPath({ next, mode: "signup", error: "too_many_attempts" }),
  );

  const origin = await authRedirectOrigin();
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        terms_accepted_at: new Date().toISOString(),
      },
      emailRedirectTo,
    },
  });

  if (error) {
    const kind = authErrorKind(error);
    if (kind === "confirm_email") {
      redirect(customerLoginPath({ next, notice: "confirm_email", email }));
    }
    const pageError =
      kind === "email_registered" || kind === "weak_password"
        ? kind
        : kind === "too_many_attempts"
          ? "too_many_attempts"
          : "invalid_credentials";
    redirect(customerLoginPath({ next, mode: "signup", error: pageError }));
  }

  if (
    data.user &&
    Array.isArray(data.user.identities) &&
    data.user.identities.length === 0
  ) {
    redirect(
      customerLoginPath({ next, mode: "signup", error: "email_registered" }),
    );
  }

  if (!data.session) {
    redirect(customerLoginPath({ next, notice: "confirm_email", email }));
  }

  if (data.user) {
    await rejectAdminCustomerSession(data.user.id, next);
  }

  redirect(next);
}

export async function signInWithGoogleAction(formData: FormData) {
  const next = safeRedirectPath(
    String(formData.get("next") ?? "/account"),
    "/account",
  );

  if (!isSupabaseConfigured()) {
    redirect(customerLoginPath({ next, error: "invalid_credentials" }));
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  await limitAuthAttempt(
    `google-login:${ip}`,
    customerLoginPath({ next, error: "too_many_attempts" }),
  );

  const origin = await authRedirectOrigin();
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    redirect(customerLoginPath({ next, error: "google_failed" }));
  }

  redirect(data.url);
}

export async function signOutAction() {
  if (!isSupabaseConfigured()) redirect("/");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

async function setDevAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function loginAdminWithPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const safeNext = safeAdminRedirectPath(
    String(formData.get("next") ?? "/admin"),
    "/admin",
  );

  // Cookie demo path only without Supabase; never when Supabase is configured
  if (!isSupabaseConfigured()) {
    if (!verifyAdminCredentials(email, password)) {
      redirect(`/admin/login?error=1&next=${encodeURIComponent(safeNext)}`);
    }
    await setDevAdminSession();
    redirect(safeNext);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(safeNext)}`);
  }

  const admin = await isAdminUser(data.user.id);
  if (!admin) {
    await supabase.auth.signOut();
    redirect(
      `/admin/login?error=unauthorized&next=${encodeURIComponent(safeNext)}`,
    );
  }

  redirect(safeNext);
}

export async function logoutAdminAction() {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_SESSION_COOKIE);
    redirect("/admin/login");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
