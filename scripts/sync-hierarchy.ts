/**
 * Sync Supabase catalogue to the 5-category hierarchy in catalog-hierarchy-data.ts.
 * In-place: keeps product ids/slugs/images/descriptions/stock; order_items stay valid.
 *  - matched products: category / subcategory / price updated
 *  - new products: inserted (stock 0)
 *  - variants no longer sold: available=false (never deleted)
 *  - products not in the list: published=false (never deleted)
 *
 * Usage: npx tsx scripts/sync-hierarchy.ts [--apply]   (default is a dry run)
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { slugify } from "../src/lib/admin/slug";
import {
  HIERARCHY_ROWS,
  HIERARCHY_CATEGORIES,
  HIERARCHY_SUBCATEGORIES,
  type HierarchyRow,
} from "./catalog-hierarchy-data";

config({ path: ".env" });
const apply = process.argv.includes("--apply");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function must<T>(r: { data: T; error: { message: string } | null }, what: string): T {
  if (r.error) throw new Error(`${what}: ${r.error.message}`);
  return r.data;
}

type V = { label: string; unit: string; qty: number | null; paise: number; sort: number; weightG: number | null };

function variantsOf(r: HierarchyRow): V[] {
  const [, , , p250, p500, p1kg, pack, pc] = r;
  const out: V[] = [];
  if (p250 > 0) out.push({ label: "250 GM", unit: "g", qty: 250, paise: p250 * 100, sort: 0, weightG: 250 });
  if (p500 > 0) out.push({ label: "500 GM", unit: "g", qty: 500, paise: p500 * 100, sort: 1, weightG: 500 });
  if (p1kg > 0) out.push({ label: "1 KG", unit: "kg", qty: 1, paise: p1kg * 100, sort: 2, weightG: 1000 });
  if (pack > 0) out.push({ label: "PACK", unit: "pack", qty: null, paise: pack * 100, sort: 3, weightG: null });
  if (pc > 0) out.push({ label: "PC", unit: "pc", qty: null, paise: pc * 100, sort: 4, weightG: null });
  return out;
}

const skuFor = (slug: string, v: V) =>
  `JJ-${slugify(slug)}-${slugify(v.qty ? `${v.qty}${v.unit}` : v.unit)}`.toUpperCase();

async function main() {
  const names = new Set<string>();
  for (const r of HIERARCHY_ROWS) {
    if (names.has(r[2])) throw new Error(`duplicate ${r[2]}`);
    names.add(r[2]);
    if (!variantsOf(r).length) throw new Error(`no price: ${r[2]}`);
  }
  const counts: Record<string, number> = {};
  HIERARCHY_ROWS.forEach((r) => (counts[r[0]] = (counts[r[0]] ?? 0) + 1));
  console.log("rows", HIERARCHY_ROWS.length, counts, "(expect sweets32 namkeen74 bakery31 gajak17 gifting26)");

  const existing = must(
    await sb
      .from("products")
      .select("id,slug,name,source_name,published,product_variants(id,label,price_paise,available)"),
    "products",
  ) as any[];
  const byName = new Map(existing.map((p) => [(p.source_name ?? p.name).trim().toUpperCase(), p]));
  // new (client) name -> legacy DB spelling, so images/descriptions carry over
  const alias: Record<string, string> = {
    "PINEAPPLE CRUNCH": "PINEAPPLE CRUNSH",
    "KADA PATTI": "KADAK PATTI",
    "SPECIAL FALAHARI MIXTURE": "SPECIAL FALAHAARI MIXTURE",
    "ALOO PALAK BHUJA": "ALOO PALAK BHUJIA",
    "ALOO PINEAPPLE BHUJA": "ALOO PINEAPPLE BHUJIA",
    "ALOO PODINA BHUJA": "ALOO PODINA BHUJIA",
    "FALHAARI DANE": "FLAHAARI DANE",
    "ATTA NANKHATAL": "ATTA NANKHATAI",
    "FALAHAARI KAPPA WAFERS (MASALA) 100GM": "FALAHAARI KAPPA WAFFERS (MASALA) 100GM",
    "FALAHAARI KAPPA WAFERS (PODINA) 100GM": "FALAHAARI KAPPA WAFFERS (PODINA) 100GM",
    "FALAHAARI KAPPA WAFERS (KALI MIRCH) 100GM": "FALAHAARI KAPPA WAFFERS (KALI MIRCH) 100GM",
  };
  const usedSlugs = new Set<string>(existing.map((e) => e.slug));

  const catIds = new Map<string, string>();
  const subIds = new Map<string, string>();
  if (apply) {
    const now = new Date().toISOString();
    for (const c of HIERARCHY_CATEGORIES) {
      const d = must(
        await sb.from("categories").upsert({ ...c, published: true, updated_at: now }, { onConflict: "slug" }).select("id").single(),
        "category",
      ) as { id: string };
      catIds.set(c.slug, d.id);
      for (const s of HIERARCHY_SUBCATEGORIES[c.slug] ?? []) {
        const sd = must(
          await sb
            .from("subcategories")
            .upsert({ category_id: d.id, ...s, published: true, updated_at: now }, { onConflict: "category_id,slug" })
            .select("id")
            .single(),
          "subcategory",
        ) as { id: string };
        subIds.set(`${c.slug}/${s.slug}`, sd.id);
      }
    }
  }

  let upd = 0, ins = 0, priceChanges = 0, vNew = 0, vOff = 0;
  const matched = new Set<string>();

  for (const r of HIERARCHY_ROWS) {
    const [cat, sub, name] = r;
    const vs = variantsOf(r);
    const p = byName.get(name) ?? byName.get(alias[name] ?? "");
    const seasonal = cat === "gajak" || sub === "winter-special";
    const subId = sub ? subIds.get(`${cat}/${sub}`) ?? null : null;

    if (p) {
      matched.add(p.id);
      upd++;
      if (apply) {
        must(
          await sb
            .from("products")
            .update({ source_name: name, category_id: catIds.get(cat)!, subcategory_id: subId, seasonal, published: true } as never)
            .eq("id", p.id),
          "update product",
        );
      }
      const live = new Set(vs.map((v) => v.label));
      for (const v of vs) {
        const ev = p.product_variants.find((x: any) => x.label === v.label);
        if (ev) {
          if (ev.price_paise !== v.paise) priceChanges++;
          if (apply) must(await sb.from("product_variants").update({ price_paise: v.paise, available: true } as never).eq("id", ev.id), "update variant");
        } else {
          vNew++;
          if (apply)
            must(
              await sb.from("product_variants").insert({
                product_id: p.id, label: v.label, sku: skuFor(p.slug, v), price_paise: v.paise, selling_unit: v.unit,
                quantity_value: v.qty, weight_g: v.weightG, stock_qty: 0, available: true, sort_order: v.sort,
              } as never),
              "insert variant",
            );
        }
      }
      for (const ev of p.product_variants)
        if (!live.has(ev.label) && ev.available) {
          vOff++;
          if (apply) must(await sb.from("product_variants").update({ available: false } as never).eq("id", ev.id), "disable variant");
        }
    } else {
      ins++;
      console.log("  NEW:", name);
      if (apply) {
        const base = slugify(name);
        let slug = base, n = 2;
        while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
        usedSlugs.add(slug);
        const np = must(
          await sb
            .from("products")
            .insert({ slug, name, source_name: name, description: "", category_id: catIds.get(cat)!, subcategory_id: subId, seasonal, published: true } as never)
            .select("id")
            .single(),
          "insert product",
        ) as { id: string };
        for (const v of vs)
          must(
            await sb.from("product_variants").insert({
              product_id: np.id, label: v.label, sku: skuFor(slug, v), price_paise: v.paise, selling_unit: v.unit,
              quantity_value: v.qty, weight_g: v.weightG, stock_qty: 0, available: true, sort_order: v.sort,
            } as never),
            "insert variant",
          );
      }
    }
  }

  const stale = existing.filter((p) => !matched.has(p.id) && p.published);
  console.log(`matched ${upd}, inserted ${ins}, price changes ${priceChanges}, new variants ${vNew}, variants disabled ${vOff}`);
  console.log(`stale products to unpublish (${stale.length}):`, stale.map((p) => p.name).join(" | "));
  if (apply) {
    for (const p of stale) must(await sb.from("products").update({ published: false } as never).eq("id", p.id), "unpublish");
    console.log("APPLIED");
  } else console.log("DRY RUN: pass --apply");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
