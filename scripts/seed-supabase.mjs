/**
 * Seed Supabase from src/data mocks.
 * Usage: node scripts/seed-supabase.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadTsData() {
  // Dynamic import won't work for TS — read catalogue via compiled path workaround:
  // We inline category/product seed via JSON export. Run after `npm run build` or use tsx.
  // For simplicity, require user to run with tsx on seed-supabase.ts instead.
  console.error(
    "Use: npx tsx scripts/seed-supabase.ts (TypeScript seed script)",
  );
  process.exit(1);
}

loadTsData();
