"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  ADMIN_EMAIL,
  ADMIN_SESSION_COOKIE,
  verifyAdminCredentials,
} from "@/lib/admin-config";
import {
  safeAdminRedirectPath,
  safeRedirectPath,
} from "@/lib/safe-redirect";

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

export async function isAdminUser(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return profile?.role === "admin";
}

export async function requireUser(redirectTo = "/login") {
  const user = await getSessionUser();
  if (!user) redirect(redirectTo);
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

  const normalized = phone.startsWith("+")
    ? phone
    : `+91${phone.replace(/\D/g, "")}`;

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

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) {
    redirect(
      `/login?step=verify&error=invalid_otp&phone=${encodeURIComponent(phone)}&next=${encodeURIComponent(next)}`,
    );
  }

  redirect(next);
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
