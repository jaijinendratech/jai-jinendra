/**
 * Seed Supabase from src/data mocks.
 * Usage: npx tsx scripts/seed-supabase.ts
 */
import { createClient } from "@supabase/supabase-js";
import { catalogueProducts, cataloguePills } from "../src/data/catalogue";
import { heroSlides, trustItems, siteConfig } from "../src/data/home";
import type { Database } from "../src/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient<Database>(url, key);

const categoryMeta: Record<
  string,
  { title: string; subtitle: string; image: string }
> = {
  namkeens: {
    title: "Crispy Namkeens",
    subtitle: "Hand-spun sev, bhujia & mixtures",
    image: "/images/cat0.jpg",
  },
  kachoris: {
    title: "Khasta Kachori & Samosa",
    subtitle: "Desi ghee shells, ready to reheat",
    image: "/images/cat1.jpg",
  },
  mithai: {
    title: "Heritage Mithai",
    subtitle: "Pure ghee sweets & festive classics",
    image: "/images/cat2.jpg",
  },
  gifts: {
    title: "Luxury Hampers & Tins",
    subtitle: "Corporate & festive gifting",
    image: "/images/cat3.jpg",
  },
  "tea-time": {
    title: "Tea-Time Combos",
    subtitle: "Khakhra, mathri & chai companions",
    image: "/images/cat4.jpg",
  },
  "dry-fruits": {
    title: "Dry Fruit Namkeens",
    subtitle: "Protein-rich roasted crunch",
    image: "/images/cat5.jpg",
  },
  combos: {
    title: "Build Your Combo",
    subtitle: "Curate your own box",
    image: "/images/cat4.jpg",
  },
};

async function seed() {
  console.log("Seeding categories…");
  const categoryIds = new Map<string, string>();

  const slugs = [
    "namkeens",
    "kachoris",
    "mithai",
    "gifts",
    "tea-time",
    "dry-fruits",
    "combos",
  ];

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const meta = categoryMeta[slug];
    const pill = cataloguePills.find((p) => p.id === slug);
    const { data, error } = await supabase
      .from("categories")
      .upsert(
        {
          slug,
          title: meta?.title ?? pill?.label ?? slug,
          subtitle: meta?.subtitle ?? "",
          image_url: meta?.image ?? null,
          sort_order: i,
          published: true,
        },
        { onConflict: "slug" },
      )
      .select("id, slug")
      .single();

    if (error) throw error;
    categoryIds.set(slug, data.id);
  }

  console.log("Seeding products…");
  for (const product of catalogueProducts) {
    const categoryId = categoryIds.get(product.category) ?? null;

    const { data: prod, error: prodErr } = await supabase
      .from("products")
      .upsert(
        {
          slug: product.slug,
          name: product.name,
          description: product.description,
          long_description: product.longDescription ?? null,
          category_id: categoryId,
          spice_note: product.spiceNote ?? null,
          dietary: product.dietary ?? [],
          badge: product.badge ?? null,
          tagline: product.tagline ?? null,
          rating: product.rating,
          review_count: product.reviewCount,
          published: true,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();

    if (prodErr) throw prodErr;

    await supabase
      .from("product_images")
      .delete()
      .eq("product_id", prod.id);

    await supabase.from("product_images").insert({
      product_id: prod.id,
      storage_path: product.image,
      alt: product.imageAlt,
      sort_order: 0,
    });

    await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", prod.id);

    const variants = product.variants.map((v, idx) => ({
      product_id: prod.id,
      label: v.label,
      sku: `${product.slug}-${v.id}`,
      price_paise: Math.round((v.price ?? product.price) * 100),
      mrp_paise: product.originalPrice
        ? Math.round(product.originalPrice * 100)
        : null,
      stock_qty: 100,
      low_stock_threshold: 5,
      sort_order: idx,
    }));

    const { error: varErr } = await supabase
      .from("product_variants")
      .insert(variants);
    if (varErr) throw varErr;
  }

  console.log("Seeding content blocks…");
  await supabase.from("content_blocks").upsert(
    [
      {
        page_key: "home",
        section_key: "site_config",
        content: siteConfig as unknown as Database["public"]["Tables"]["content_blocks"]["Row"]["content"],
      },
      {
        page_key: "home",
        section_key: "hero_slides",
        content: heroSlides as unknown as Database["public"]["Tables"]["content_blocks"]["Row"]["content"],
      },
      {
        page_key: "home",
        section_key: "trust_items",
        content: trustItems as unknown as Database["public"]["Tables"]["content_blocks"]["Row"]["content"],
      },
    ],
    { onConflict: "page_key,section_key" },
  );

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
