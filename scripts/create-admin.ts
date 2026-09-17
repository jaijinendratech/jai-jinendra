/**
 * Create or update the Supabase admin user.
 * Usage: npx tsx scripts/create-admin.ts
 */
import { createClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL, getAdminPassword } from "../src/lib/admin-config";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = ADMIN_EMAIL;
  const password = getAdminPassword();

  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );

  let userId: string;

  if (existing) {
    userId = existing.id;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    console.log(`Updated password for existing admin: ${email}`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error("Failed to create user");
    userId = data.user.id;
    console.log(`Created admin user: ${email}`);
  }

  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        role: "admin",
        full_name: "Jai Jinendra Admin",
      },
      { onConflict: "id" },
    );

  if (profileError) throw profileError;

  console.log("profiles.role set to admin");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
