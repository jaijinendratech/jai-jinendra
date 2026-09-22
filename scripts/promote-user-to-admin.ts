/**
 * Promote an existing Supabase user to admin by email (service role).
 * Usage: npx tsx scripts/promote-user-to-admin.ts user@example.com
 *
 * Kept out of "use server" auth modules so it cannot be invoked from the app.
 */
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.trim();
if (!email) {
  console.error("Usage: npx tsx scripts/promote-user-to-admin.ts <email>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function promoteUserToAdmin(targetEmail: string) {
  const { data: users, error: listError } = await admin.auth.admin.listUsers();
  if (listError) throw listError;

  const user = users.users.find(
    (u) => u.email?.toLowerCase() === targetEmail.toLowerCase(),
  );
  if (!user) throw new Error(`User not found: ${targetEmail}`);

  const { error } = await admin
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", user.id);

  if (error) throw error;
  console.log(`Promoted ${targetEmail} (${user.id}) to admin`);
}

promoteUserToAdmin(email).catch((err) => {
  console.error(err);
  process.exit(1);
});
