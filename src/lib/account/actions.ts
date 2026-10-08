"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  accountAddressSchema,
  profileUpdateSchema,
} from "@/lib/validation/schemas";

export async function updateAccountProfileAction(formData: FormData) {
  const user = await requireUser("/login?next=/account/profile");
  if (!isSupabaseConfigured()) {
    redirect("/account/profile?notice=supabase-required");
  }

  const parsed = profileUpdateSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  });
  if (!parsed.success) {
    redirect("/account/profile?error=save-failed");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName?.trim() || null,
      email: parsed.data.email?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    redirect("/account/profile?error=save-failed");
  }

  revalidatePath("/account");
  revalidatePath("/account/profile");
  redirect("/account/profile?notice=saved");
}

export async function saveAccountAddressAction(formData: FormData) {
  const user = await requireUser("/login?next=/account/addresses");
  if (!isSupabaseConfigured()) {
    redirect("/account/addresses?notice=supabase-required");
  }

  const idRaw = String(formData.get("id") ?? "");
  const parsed = accountAddressSchema.safeParse({
    id: idRaw || undefined,
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? "") || null,
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    pincode: String(formData.get("pincode") ?? ""),
    isDefault: formData.get("isDefault") === "on",
  });

  if (!parsed.success) {
    redirect("/account/addresses?error=missing-fields");
  }

  const { id, isDefault, ...fields } = parsed.data;
  const payload = {
    user_id: user.id,
    name: fields.name,
    phone: fields.phone,
    line1: fields.line1,
    line2: fields.line2 || null,
    city: fields.city,
    state: fields.state,
    pincode: fields.pincode,
    is_default: Boolean(isDefault),
  };

  const supabase = await createClient();

  if (payload.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  if (id) {
    const { error } = await supabase
      .from("addresses")
      .update(payload)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) redirect("/account/addresses?error=save-failed");
  } else {
    const { error } = await supabase.from("addresses").insert(payload);
    if (error) redirect("/account/addresses?error=save-failed");
  }

  revalidatePath("/account/addresses");
  redirect("/account/addresses?notice=saved");
}

export async function deleteAccountAddressAction(formData: FormData) {
  const user = await requireUser("/login?next=/account/addresses");
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/account/addresses");
  redirect("/account/addresses?notice=deleted");
}

export async function setDefaultAccountAddressAction(formData: FormData) {
  const user = await requireUser("/login?next=/account/addresses");
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id);
  await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/account/addresses");
  redirect("/account/addresses?notice=default-set");
}

/**
 * Save a delivery address from checkout. Skips exact duplicates, never
 * redirects (checkout continues), and the first saved address becomes default.
 */
export async function saveCheckoutAddressAction(
  input: unknown,
): Promise<{ ok: boolean }> {
  const user = await requireUser("/login?next=/checkout");
  if (!isSupabaseConfigured()) return { ok: false };

  const parsed = accountAddressSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const f = parsed.data;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("addresses")
    .select("id, name, phone, line1, line2, city, state, pincode")
    .eq("user_id", user.id);

  const norm = (v: string | null | undefined) =>
    (v ?? "").trim().toLowerCase();
  const duplicate = (existing ?? []).some(
    (a) =>
      norm(a.line1) === norm(f.line1) &&
      norm(a.line2) === norm(f.line2) &&
      norm(a.city) === norm(f.city) &&
      norm(a.state) === norm(f.state) &&
      a.pincode === f.pincode &&
      a.phone === f.phone &&
      norm(a.name) === norm(f.name),
  );
  if (duplicate) return { ok: true };

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    name: f.name,
    phone: f.phone,
    line1: f.line1,
    line2: f.line2 || null,
    city: f.city,
    state: f.state,
    pincode: f.pincode,
    is_default: (existing ?? []).length === 0,
  });
  if (error) return { ok: false };

  revalidatePath("/account/addresses");
  return { ok: true };
}
