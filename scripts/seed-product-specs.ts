/**
 * Seed product detail copy from "Final Products specification list.xlsx" (pre-extracted to JSON).
 *
 * Maps per product:
 *   Name -> name | Long description -> long_description (<p>) | short description -> description (<p>, first sentence)
 *   Ingredients -> ingredients[] | Highlights -> highlights[] | Tags (1st = badge) -> badge + tags[]
 *   Spice note -> spice_note | Shelf life -> shelf_life | Best paired with -> attribute "best_paired_with"
 *
 * Usage: npx tsx scripts/seed-product-specs.ts <spec.json> [--apply]   (default dry run)
 */
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env" });
const apply = process.argv.includes("--apply");
const specPath = process.argv.find((a) => a.endsWith(".json"))!;
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

/** sheet name (trimmed) -> catalogue source_name, where they differ */
const MAP: Record<string, string> = {
  "Ajwain Cookies": "AJWAIN BISCUIT", "Atta Cookies": "ATTA BISCUIT", "Atta Nankhatai Cookies": "ATTA NANKHATAL",
  "Choco Chip Cookies": "CHOCO CHIPS", "Coconut Badam Cookies": "COCONUT BADAM", "Falahaari Almond Stick Cookies": "FALAHAARI ALMOND STICK",
  "Jeera Cookies": "JEERA BISCUIT", "Kaju Honey Cookies": "KAJU HONEY", "Nankhatai Cookies": "NANKHATAI",
  "Tooti Frooti Cookies": "TOOTI FRUITY BISCUIT", "Almond Biscotti Cookies": "ALMOND BISCOTTI", "Badamika Cookies": "BADAMIKA",
  "Cashew Falahaari Cookies": "CASHEW FALAHAARI COOKIES", "Honey Oats Cookies": "HONEY OATS COOKIES", "Jam Cookies": "JAM COOKIES",
  "Kaju Cookies": "KAJU COOKIES", "Kesar Pistamika Cookies": "KESAR PISTAMIKA", "Coconut Cookies": "COCONUT COOKIES",
  "Chocolate Gajak": "CHOCOLATE GAJAK", "Dryfruit Roll Gajak": "DRYFRUIT ROLL", "Dryfruit Samosa Gajak": "DRYFRUIT SAMOSA",
  "Gajak Barfi": "GAJAK BARFI", "Gud Roll Gajak": "GUD ROLL", "Kadak Patti Gajak": "KADA PATTI", "Madrasi Chikki": "MADRASI CHIKKI",
  "Moongfali (Peanut) Chikki": "MOONGFALI CHIKKI", "Shakkar Gajak": "SHAKKAR GAJAK", "Soan Gajak": "SOAN GAJAK",
  "Til (Sesame) Chikki": "TILL CHIKKI", "Til (Sesame) Laddu": "TILL LADDU",
  "Falahaari Aloo Chivda": "ALU CHIVDA", "Falahaari Badam Laccha": "BADAM LACHA", "Charkha Falahaari Mix": "CHARKA FALAHAARI",
  "Chatora Wafers": "CHATORA (70GM)", "Falahaari Dry Khichdi": "DRY KHICHDI (200GM)", "Falahaari Dana (Peanut)": "FALHAARI DANE",
  "Falahaari Kappa Wafers - Kali Mirch": "FALAHAARI KAPPA WAFERS (KALI MIRCH) 100GM",
  "Falahaari Kappa Wafers - Masala": "FALAHAARI KAPPA WAFERS (MASALA) 100GM",
  "Falahaari Kappa Wafers - Podina": "FALAHAARI KAPPA WAFERS (PODINA) 100GM",
  "Rajgira Sabudana Mixture (Falahaari)": "RAJGIRA SABUDANA MIX", "Special Falahaari Mixture": "SPECIAL FALAHARI MIXTURE",
  "Rajgira Bhujia (Falahaari)": "RAJGIRA BHUJIYA", "Rajgira Sev (Falahaari)": "RAJGIRA SEV", "Sabudana Falahaari": "SABUDANA FALAHAARI",
  "Bhakarwadi": "BHAKAR WADI", "Falahaari Mathri": "FALAHARI MATHRI (400GM)", "Khasta Mathri": "KHASTA MATHRI (400GM)",
  "Dal Moth": "DALMOTH", "Dilli Delhi Mix": "DILLI MIX", "Kota Mixture": "KOTA MIX", "Cornflakes Mix": "CORNFLAKES MIX (200GM)",
  "Aloo Masala Bhujia": "ALOO BHUJIYA", "Aloo Palak Bhujia": "ALOO PALAK BHUJA", "Aloo Podina Bhujia": "ALOO PODINA BHUJA",
  "Aloo Pineapple Bhujia": "ALOO PINEAPPLE BHUJA", "Hing Mogar": "HEENG MOGAR", "Tasty Mix": "TASTY",
};

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** First sentence; the sheet's long copy always opens with "<Name> is …". */
function shortOf(long: string): string {
  const m = long.match(/^.+?[.!?](?=\s|$)/);
  return (m ? m[0] : long).trim();
}

function ingredientsOf(raw: string): string[] {
  const parts = clean(raw).split(",").map((x) => x.trim()).filter(Boolean);
  const last = parts.pop();
  if (last) parts.push(...last.split(/\s+and\s+/i).map((x) => x.trim()).filter(Boolean));
  return parts.map(cap);
}

async function main() {
  const rows: string[][] = JSON.parse(readFileSync(specPath, "utf8")).slice(1);
  const { data: prods, error } = await sb.from("products").select("id,name,source_name,slug,published");
  if (error) throw error;
  const bySrc = new Map((prods as any[]).map((p) => [String(p.source_name ?? p.name).toUpperCase(), p]));

  const updates: any[] = [];
  const unmatched: string[] = [];
  const used = new Set<string>();
  for (const r of rows) {
    const sheetName = clean(r[1]);
    const key = (MAP[sheetName] ?? sheetName).toUpperCase();
    const p = bySrc.get(key);
    if (!p) { unmatched.push(sheetName); continue; }
    if (used.has(p.id)) throw new Error(`two sheet rows map to ${key}`);
    used.add(p.id);
    const long = clean(r[2]);
    const tags = clean(r[6]) ? clean(r[6]).split(/[|,]/).map((t) => t.trim()).filter(Boolean) : [];
    updates.push({
      id: p.id, sheetName, key,
      patch: {
        name: sheetName,
        description: `<p>${esc(shortOf(long))}</p>`,
        long_description: `<p>${esc(long)}</p>`,
        ingredients: ingredientsOf(r[3]),
        highlights: r[4].split("|").map(clean).filter(Boolean),
        spice_note: clean(r[7]) || null,
        shelf_life: clean(r[8]) || null,
        ...(tags.length ? { badge: tags[0], tags, ...(tags.some((t) => /^bestseller$/i.test(t)) ? { bestseller: true } : {}) } : {}),
      },
      pairing: clean(r[5]),
    });
  }
  console.log(`rows ${rows.length}, matched ${updates.length}, unmatched: ${unmatched.join(" | ") || "none"}`);
  if (unmatched.length) process.exit(1);

  for (const u of updates.slice(0, 3)) console.log(JSON.stringify(u, null, 1));
  console.log("short lengths max", Math.max(...updates.map((u) => u.patch.description.length)));
  console.log("ingredient samples:", updates.filter((_, i) => i % 15 === 0).map((u) => u.patch.ingredients.join(" / ")));

  if (!apply) return console.log("DRY RUN: pass --apply");

  const { data: def, error: dErr } = await sb
    .from("attribute_definitions")
    .upsert({ key: "best_paired_with", label: "Best paired with", data_type: "text", active: true } as never, { onConflict: "key" })
    .select("id").single();
  if (dErr) throw dErr;

  for (const u of updates) {
    const e1 = await sb.from("products").update(u.patch as never).eq("id", u.id);
    if (e1.error) throw new Error(`${u.sheetName}: ${e1.error.message}`);
    if (u.pairing) {
      const e2 = await sb.from("product_attribute_values").upsert(
        { product_id: u.id, attribute_id: (def as any).id, value_text: u.pairing } as never,
        { onConflict: "product_id,attribute_id" },
      );
      if (e2.error) throw new Error(`${u.sheetName} pairing: ${e2.error.message}`);
    }
  }
  console.log("APPLIED", updates.length);
}

main().catch((e) => { console.error(e); process.exit(1); });
