"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export async function updateAccountProfileAction(formData: FormData) {
  const user = await requireUser("/login?next=/account/profile");
  if (!isSupabaseConfigured()) {
    redirect("/account/profile?notice=supabase-required");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("fullName") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
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

  const id = String(formData.get("id") ?? "");
  const isDefault = formData.get("isDefault") === "on";
  const payload = {
    user_id: user.id,
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    line1: String(formData.get("line1") ?? "").trim(),
    line2: String(formData.get("line2") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    pincode: String(formData.get("pincode") ?? "").trim(),
    is_default: isDefault,
  };

  if (!payload.name || !payload.phone || !payload.line1 || !payload.city || !payload.state || !payload.pincode) {
    redirect("/account/addresses?error=missing-fields");
  }

  const supabase = await createClient();

  if (isDefault) {
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
