/**
 * Upload carousel banners to Supabase Storage and upsert content_blocks
 * so storefront carousels render from the DB and stay editable in Admin.
 *
 * Usage: npx tsx scripts/seed-carousel-banners.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "../src/types/database";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient<Database>(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const MAX_WIDTH = 1600;
const FOLDER = "carousels";

type SlideDef = {
  id: string;
  file: string;
  alt: string;
};

const CAROUSELS: {
  pageKey: string;
  slides: SlideDef[];
}[] = [
  {
    pageKey: "home",
    slides: [
      {
        id: "diwali",
        file: "banner-home-diwali.png",
        alt: "Celebrate the Joy of Diwali - Authentic Indian Festive Treats - Jai Jinendra Namkeens",
      },
      {
        id: "namkeen",
        file: "banner-home-namkeen.png",
        alt: "Crisp. Savory. Authentic. Handcrafted Rajasthani Namkeens - Jai Jinendra Namkeens",
      },
    ],
  },
  {
    pageKey: "sweets",
    slides: [
      {
        id: "kaju-katli",
        file: "banner-sweets-katli.png",
        alt: "Indulge in Royal Mithai - Pure Cow Ghee Sweets - Kaju Katli, Motichoor, Gulab Jamun - Jai Jinendra Namkeens",
      },
      {
        id: "motichoor",
        file: "banner-sweets-laddu.png",
        alt: "Halwai Favourites - Motichoor Laddu, Pista Gulab Jamun, Kesar Peda - Jai Jinendra Namkeens",
      },
    ],
  },
  {
    pageKey: "kachoris",
    slides: [
      {
        id: "dal-kachori",
        file: "banner-kachori-khasta.png",
        alt: "Khasta Dal Kachori - Fresh from the Kadhai - Jai Jinendra Namkeens",
      },
      {
        id: "snacks-banner",
        file: "banner-kachori-snacks.png",
        alt: "Chai-Time Hot Snacks - Kachori, Mathri, Sev - Jai Jinendra Namkeens",
      },
    ],
  },
  {
    pageKey: "hampers",
    slides: [
      {
        id: "heritage-box",
        file: "banner-hamper-heritage.png",
        alt: "Gift Hampers & Keepsakes - Diwali, Weddings, Corporate - Jai Jinendra Namkeens",
      },
      {
        id: "aristocrat",
        file: "banner-hamper-trunk.png",
        alt: "The Aristocrat Trunk - Luxury Mithai & Namkeen Gifts - Jai Jinendra Namkeens",
      },
    ],
  },
  {
    pageKey: "combos",
    slides: [
      {
        id: "combo-builder",
        file: "banner-combo-builder.png",
        alt: "Build Your Combo Pack - Mix Sweet + Savory - Jai Jinendra Namkeens",
      },
      {
        id: "chai-nashta",
        file: "banner-combo-chai.png",
        alt: "Chai-Nashta Combo - Everyday Rituals, Gift-Ready - Jai Jinendra Namkeens",
      },
    ],
  },
];

async function uploadBanner(fileName: string, alt: string) {
  const localPath = resolve(process.cwd(), "public/images", fileName);
  if (!existsSync(localPath)) {
    throw new Error(`Missing local file: ${localPath}`);
  }

  const storageName = fileName.replace(/\.png$/i, ".webp");
  const storagePath = `${FOLDER}/${storageName}`;

  const optimized = await sharp(readFileSync(localPath))
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(storagePath, optimized, {
      contentType: "image/webp",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Upload failed for ${fileName}: ${uploadError.message}`);
  }

  const { data: pub } = supabase.storage.from("media").getPublicUrl(storagePath);

  const { data: existing } = await supabase
    .from("media_assets")
    .select("id")
    .eq("storage_path", storagePath)
    .maybeSingle();

  if (!existing) {
    const { error: mediaError } = await supabase.from("media_assets").insert({
      storage_path: storagePath,
      alt,
      folder: FOLDER,
    });
    if (mediaError) {
      console.warn(`media_assets insert skipped for ${storagePath}:`, mediaError.message);
    }
  } else {
    await supabase
      .from("media_assets")
      .update({ alt, folder: FOLDER })
      .eq("id", existing.id);
  }

  return pub.publicUrl;
}

async function main() {
  console.log("Uploading carousel banners to Storage…");

  for (const carousel of CAROUSELS) {
    const slides: { id: string; src: string; alt: string }[] = [];

    for (const slide of carousel.slides) {
      const src = await uploadBanner(slide.file, slide.alt);
      slides.push({ id: slide.id, src, alt: slide.alt });
      console.log(`  ✓ ${carousel.pageKey}/${slide.id} → ${src}`);
    }

    const { error } = await supabase.from("content_blocks").upsert(
      {
        page_key: carousel.pageKey,
        section_key: "hero_slides",
        content: slides as unknown as Json,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page_key,section_key" },
    );

    if (error) {
      throw new Error(
        `content_blocks upsert failed for ${carousel.pageKey}: ${error.message}`,
      );
    }
    console.log(`  ✓ content_blocks ${carousel.pageKey}/hero_slides (${slides.length} slides)`);
  }

  console.log("Carousel banners seeded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
