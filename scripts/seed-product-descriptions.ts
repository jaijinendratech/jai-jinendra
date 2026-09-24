/**
 * Generate and upsert product + category descriptions in Supabase.
 * Usage: npx tsx scripts/seed-product-descriptions.ts
 */
import { resolve } from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function displayName(raw: string) {
  return raw
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function packHint(raw: string) {
  const m = raw.match(/\(([^)]+)\)/);
  return m ? m[1].trim() : null;
}

type Copy = {
  tagline: string;
  description: string;
  long_description: string;
  seo_title: string;
  seo_description: string;
  origin: string;
  shelf_life: string;
};

function copyFor(name: string, categorySlug: string | null): Copy {
  const title = displayName(name);
  const pack = packHint(name);
  const packLine = pack ? ` Available in ${pack} packs.` : "";
  const cat = categorySlug ?? "general";

  const byKeyword = (): Partial<Copy> | null => {
    const n = name.toLowerCase();
    if (n.includes("kaju katli"))
      return {
        tagline: "Pure Cow Ghee",
        description:
          "Silky silver-leaf kaju katli — stone-ground cashews slow-cooked in fragrant bilona ghee.",
        long_description:
          "<p>Our signature <strong>Kaju Katli</strong> is made from premium cashews, simmered gently in pure cow ghee and finished with edible silver leaf. Melts cleanly on the tongue — ideal for festivals, weddings, and everyday mithai moments.</p><p>Packed the same day from our heritage kitchen for pan-India freshness.</p>",
      };
    if (n.includes("bhujiya") || n.includes("bhujia"))
      return {
        tagline: "Fresh Batch Daily",
        description: `Crisp ${title} — thin potato strands tossed in house-ground spices and fried for lasting crunch.${packLine}`,
        long_description: `<p><strong>${title}</strong> is fried in small batches with carefully balanced spices for that classic Rajasthani chatpata bite. Nitrogen-sealed immediately so every handful stays crisp from our kadhai to your doorstep.</p>`,
      };
    if (n.includes("sev") && !n.includes("doodh"))
      return {
        tagline: "Hand-Spun Crunch",
        description: `Fine ${title} — gram-flour sev spun and fried to a light, shatter-crisp finish.${packLine}`,
        long_description: `<p>Our <strong>${title}</strong> is crafted from fresh besan and aromatic spices, extruded thin and fried until golden. Perfect with chai, chaat, or festive thalis — sealed for pan-India crispness.</p>`,
      };
    if (n.includes("mathri"))
      return {
        tagline: "Chai-Time Classic",
        description: `Flaky ${title} — layered dough fried golden for the perfect tea-time companion.${packLine}`,
        long_description: `<p><strong>${title}</strong> brings the comfort of home kitchens: crisp layers, subtle spice, and a finish that pairs beautifully with masala chai. Freshly packed for lasting crunch.</p>`,
      };
    if (n.includes("kachori") || n.includes("samosa"))
      return {
        tagline: "Ready to Reheat",
        description: `Golden ${title} — flaky shells with savoury filling, kitchen-fresh and ready for your thali.${packLine}`,
        long_description: `<p>Hand-shaped <strong>${title}</strong> with multilayer pastry and a carefully spiced filling. Reheat gently for that just-fried aroma — Jain-friendly kitchen standards, nitrogen-packed for transit.</p>`,
      };
    if (n.includes("gajak") || n.includes("chikki") || n.includes("revdi"))
      return {
        tagline: "Seasonal Speciality",
        description: `Traditional ${title} — jaggery-bound crunch with roasted nuts and seeds for winter festive trays.${packLine}`,
        long_description: `<p><strong>${title}</strong> is made in the seasonal tradition of Rajasthan: slow-cooked gud, roasted nuts or til, and a clean snap in every bite. A festive favourite for Diwali and winter gifting.</p>`,
      };
    if (n.includes("laddu") || n.includes("paak") || n.includes("barfi"))
      return {
        tagline: "Heritage Mithai",
        description: `Homestyle ${title} — slow-cooked with pure ingredients for rich festive sweetness.${packLine}`,
        long_description: `<p>Our <strong>${title}</strong> follows time-honoured recipes from the Jai Jinendra kitchen — aromatic, wholesome, and gift-ready. Ideal for celebrations, temple offerings, and family mithai boxes.</p>`,
      };
    if (n.includes("cookie") || n.includes("biscuit") || n.includes("nankhatai") || n.includes("biscotti"))
      return {
        tagline: "Bakery Fresh",
        description: `Artisanal ${title} — baked for a buttery crumb and tea-time dunkability.${packLine}`,
        long_description: `<p><strong>${title}</strong> is baked in small batches with quality flours and flavourings. A delightful companion to chai, coffee, or festive dessert platters — packed to stay crisp in transit.</p>`,
      };
    if (n.includes("khari") || n.includes("toast"))
      return {
        tagline: "Tea-Time Bites",
        description: `Light ${title} — flaky, golden, and made for evening chai rituals.${packLine}`,
        long_description: `<p>Crisp <strong>${title}</strong> from our bakery line: airy layers, clean flavour, and lasting freshness when nitrogen-sealed. Pair with chai for the classic Jai Jinendra tea-time moment.</p>`,
      };
    if (n.includes("cake") || n.includes("brownie") || n.includes("muffin") || n.includes("cream roll"))
      return {
        tagline: "Bakery Treat",
        description: `Soft ${title} — moist crumb and bakery-fresh flavour for celebrations and gifting.${packLine}`,
        long_description: `<p>Our <strong>${title}</strong> is baked with care for a tender crumb and balanced sweetness. Perfect for tea trays, kids’ treats, and festive dessert assortments.</p>`,
      };
    if (n.includes("dryfruit") || n.includes("dry fruit") || n.includes("hamper") || n.includes("tray") || n.includes("tokri") || n.includes("box"))
      return {
        tagline: "Gift Ready",
        description: `Premium ${title} — curated presentation for Diwali, weddings, and corporate gifting.${packLine}`,
        long_description: `<p><strong>${title}</strong> is assembled for impressive gifting: quality dry fruits and/or festive treats in keepsake packaging. Multi-address friendly and ready for celebrations across India.</p>`,
      };
    if (n.includes("mix") || n.includes("mixture") || n.includes("chivda") || n.includes("dalmoth"))
      return {
        tagline: "Timepass Crunch",
        description: `Savory ${title} — a balanced blend of crisp bits and spices for everyday snacking.${packLine}`,
        long_description: `<p><strong>${title}</strong> brings together classic namkeen elements in one addictive mix. Freshly fried, spice-balanced, and sealed for doorstep crispness pan-India.</p>`,
      };
    if (n.includes("wafer") || n.includes("waffer") || n.includes("papad"))
      return {
        tagline: "Light & Crisp",
        description: `Crispy ${title} — thinly sliced and fried for airy, snackable crunch.${packLine}`,
        long_description: `<p>Light <strong>${title}</strong> with a clean snap — great for evening timepass, kids’ snack boxes, and travel. Packed fresh from our kitchen.</p>`,
      };
    return null;
  };

  const keyword = byKeyword();

  const defaults: Record<string, Copy> = {
    namkeen: {
      tagline: "Freshly Fried",
      description: `Authentic ${title} from our Rajasthani namkeen kitchen — crisp, aromatic, and nitrogen-sealed.${packLine}`,
      long_description: `<p><strong>${title}</strong> is prepared with traditional spices and careful frying technique for lasting crunch. A staple for chai time, road trips, and festive snack trays — dispatched pan-India.</p>`,
      seo_title: `${title} | Jai Jinendra Namkeens`,
      seo_description: `Buy ${title} online from Jai Jinendra — authentic Rajasthani namkeen, freshly packed and delivered pan-India.`,
      origin: "Rajasthan",
      shelf_life: "Best within 45–60 days of packing",
    },
    sweets: {
      tagline: "Pure Veg Mithai",
      description: `Festive ${title} — rich, aromatic sweets crafted for celebrations and everyday indulgence.${packLine}`,
      long_description: `<p>Celebrate with <strong>${title}</strong> from the Jai Jinendra mithai collection. Made with quality ingredients and packed for freshness — ideal for Diwali, weddings, and thoughtful gifting.</p>`,
      seo_title: `${title} | Jai Jinendra Sweets`,
      seo_description: `Order ${title} from Jai Jinendra — heritage sweets and dry-fruit mithai delivered pan-India.`,
      origin: "Rajasthan",
      shelf_life: "Best within 15–30 days of packing",
    },
    cookies: {
      tagline: "Bakery Fresh",
      description: `Homestyle ${title} — baked for chai-time dunking and festive cookie platters.${packLine}`,
      long_description: `<p><strong>${title}</strong> is baked in small batches for a tender bite and clean flavour. Pair with tea or gift in an assortment box from Jai Jinendra Bakery.</p>`,
      seo_title: `${title} | Jai Jinendra Bakery`,
      seo_description: `Shop ${title} online — artisanal cookies and biscuits from Jai Jinendra, delivered pan-India.`,
      origin: "Rajasthan",
      shelf_life: "Best within 30–45 days of packing",
    },
    "dry-cakes": {
      tagline: "Bakery Treat",
      description: `Soft ${title} — moist bakery cake perfect for tea trays and celebrations.${packLine}`,
      long_description: `<p>Enjoy <strong>${title}</strong> from our dry-cake range — tender crumb, balanced sweetness, and gift-friendly packing for birthdays and festive dessert boxes.</p>`,
      seo_title: `${title} | Jai Jinendra Bakery`,
      seo_description: `Buy ${title} from Jai Jinendra Bakery — dry cakes and muffins for gifting and tea time.`,
      origin: "Rajasthan",
      shelf_life: "Best within 7–15 days of packing",
    },
    gajak: {
      tagline: "Winter Speciality",
      description: `Traditional ${title} — seasonal gajak and chikki made for festive winter trays.${packLine}`,
      long_description: `<p><strong>${title}</strong> follows seasonal Rajasthani craft with jaggery and roasted nuts or seeds. A winter classic for Diwali boxes and family gifting.</p>`,
      seo_title: `${title} | Jai Jinendra Gajak`,
      seo_description: `Order ${title} online — traditional gajak, chikki and revdi from Jai Jinendra.`,
      origin: "Rajasthan",
      shelf_life: "Best within 30–45 days of packing",
    },
    gifting: {
      tagline: "Corporate & Festive",
      description: `Premium ${title} — presentation-ready gifting for Diwali, weddings, and offices.${packLine}`,
      long_description: `<p>Make an impression with <strong>${title}</strong>. Curated dry fruits and festive treats in elegant packaging — suited to multi-address corporate and wedding dispatch.</p>`,
      seo_title: `${title} | Jai Jinendra Gifting`,
      seo_description: `Send ${title} with Jai Jinendra — luxury dry-fruit hampers and trays for festive gifting.`,
      origin: "Rajasthan",
      shelf_life: "See pack for best-before date",
    },
    "tea-time-bites": {
      tagline: "Chai Companion",
      description: `Crisp ${title} — light bakery bites made for evening chai and coffee breaks.${packLine}`,
      long_description: `<p><strong>${title}</strong> is a tea-time essential from Jai Jinendra: flaky or toasted, lightly flavoured, and packed for lasting freshness with every sip of chai.</p>`,
      seo_title: `${title} | Jai Jinendra Tea-Time`,
      seo_description: `Buy ${title} online — khari, toast and tea-time bites from Jai Jinendra Namkeens.`,
      origin: "Rajasthan",
      shelf_life: "Best within 30–45 days of packing",
    },
  };

  const base =
    defaults[cat] ??
    ({
      tagline: "100% Pure Veg",
      description: `Premium ${title} from Jai Jinendra — handcrafted, pure vegetarian, and packed for pan-India freshness.${packLine}`,
      long_description: `<p><strong>${title}</strong> is part of the Jai Jinendra collection of authentic Rajasthani snacks, sweets, and bakery treats. Freshly prepared and carefully packed for doorstep delivery.</p>`,
      seo_title: `${title} | Jai Jinendra`,
      seo_description: `Shop ${title} at Jai Jinendra — authentic vegetarian snacks and sweets delivered across India.`,
      origin: "Rajasthan",
      shelf_life: "See pack for best-before date",
    } satisfies Copy);

  return {
    ...base,
    ...keyword,
    seo_title: keyword?.seo_title ?? base.seo_title,
    seo_description: keyword?.seo_description ?? base.seo_description,
    origin: base.origin,
    shelf_life: base.shelf_life,
    tagline: keyword?.tagline ?? base.tagline,
    description: keyword?.description ?? base.description,
    long_description: keyword?.long_description ?? base.long_description,
  };
}

const CATEGORY_COPY: Record<string, { title?: string; subtitle: string }> = {
  namkeen: {
    subtitle:
      "Sev, bhujia, mixtures & timepass crunch — freshly fried and nitrogen-sealed for pan-India crispness.",
  },
  namkeens: {
    subtitle:
      "Hand-spun sev, bhujia & royal mixtures from our Rajasthani kadhai — packed the same day.",
  },
  sweets: {
    subtitle:
      "Dry-fruit mithai, kaju katli & festive classics slow-cooked for celebrations and gifting.",
  },
  mithai: {
    subtitle:
      "Pure ghee sweets & heritage mithai for Diwali trays, weddings, and everyday indulgence.",
  },
  cookies: {
    subtitle:
      "Heritage cookies and biscuits by weight — baked for chai dunking and festive platters.",
  },
  "dry-cakes": {
    subtitle:
      "Muffins, brownies & slice cakes with a soft bakery crumb for tea trays and gifting.",
  },
  gajak: {
    subtitle:
      "Seasonal gajak, chikki & revdi — jaggery-bound winter specialties for festive boxes.",
  },
  gifting: {
    subtitle:
      "Dry-fruit trays, handle hampers & gift boxes — corporate and wedding-ready presentation.",
  },
  gifts: {
    subtitle:
      "Luxury hampers & embossed tins for Diwali, weddings, and multi-address corporate gifting.",
  },
  "tea-time-bites": {
    subtitle:
      "Khari, toast & chai companions — light, flaky bakery bites for evening tea rituals.",
  },
  "tea-time": {
    subtitle:
      "Khakhra, mathri & chai companions for everyday tea-time and travel snack boxes.",
  },
  "dry-fruits": {
    subtitle:
      "Protein-rich roasted crunch and dry-fruit namkeens for wholesome snacking.",
  },
  "khasta-kachori-samosa": {
    subtitle:
      "Flaky desi-ghee shells with savoury fillings — kitchen-fresh and ready to reheat.",
  },
  combos: {
    subtitle:
      "Build your own tasting box — mix namkeens, mithai, and tea-time bites in one gift tray.",
  },
};

async function main() {
  console.log("Updating category subtitles…");
  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("id, slug, title, subtitle");
  if (catErr) throw catErr;

  for (const cat of categories ?? []) {
    const copy = CATEGORY_COPY[cat.slug];
    if (!copy) continue;
    const { error } = await supabase
      .from("categories")
      .update({
        subtitle: copy.subtitle,
        ...(copy.title ? { title: copy.title } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", cat.id);
    if (error) throw error;
    console.log(`  ✓ category ${cat.slug}`);
  }

  console.log("Updating product descriptions…");
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, slug, name, category_id, categories(slug)");
  if (prodErr) throw prodErr;

  let updated = 0;
  for (const product of products ?? []) {
    const catRel = product.categories as
      | { slug: string }
      | { slug: string }[]
      | null;
    const categorySlug = Array.isArray(catRel)
      ? catRel[0]?.slug ?? null
      : catRel?.slug ?? null;
    const copy = copyFor(product.name, categorySlug);

    const { error } = await supabase
      .from("products")
      .update({
        description: copy.description,
        long_description: copy.long_description,
        tagline: copy.tagline,
        seo_title: copy.seo_title,
        seo_description: copy.seo_description,
        origin: copy.origin,
        shelf_life: copy.shelf_life,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (error) {
      console.error(`  ✗ ${product.slug}: ${error.message}`);
      continue;
    }
    updated += 1;
    if (updated % 25 === 0) console.log(`  … ${updated} products`);
  }

  console.log(`Done. Updated ${updated} products and category copy.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
