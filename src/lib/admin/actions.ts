"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import type { EnquiryStatus, OrderStatus, PaymentStatus } from "@/types/database";

function revalidateAdmin(...paths: string[]) {
  for (const p of paths) revalidatePath(p);
}

function parseList(raw: string): string[] {
  return raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function moneyToPaise(raw: FormDataEntryValue | null): number {
  return Math.round(Number(raw ?? 0) * 100);
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;

  const admin = createAdminClient();
  await admin.from("orders").update({ status }).eq("id", orderId);
  revalidateAdmin("/admin/orders", `/admin/orders/${orderId}`, "/admin", "/admin/customers");
}

export async function updateOrderPaymentStatusAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as PaymentStatus;

  const admin = createAdminClient();
  await admin.from("orders").update({ payment_status: status }).eq("id", orderId);
  revalidateAdmin("/admin/orders", `/admin/orders/${orderId}`, "/admin", "/admin/customers");
}

export async function updateOrderShippingAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const orderId = String(formData.get("orderId") ?? "");
  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({
      courier_name: String(formData.get("courierName") ?? "") || null,
      awb_code: String(formData.get("awbCode") ?? "") || null,
      shipment_id: String(formData.get("shipmentId") ?? "") || null,
      tracking_url: String(formData.get("trackingUrl") ?? "") || null,
      shipping_status: String(formData.get("shippingStatus") ?? "") || null,
    })
    .eq("id", orderId);

  revalidateAdmin("/admin/orders", `/admin/orders/${orderId}`);
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    redirect("/admin/products?notice=supabase-required");
  }

  const { sanitizeAdminHtml } = await import("@/lib/sanitize-html");

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = sanitizeAdminHtml(String(formData.get("description") ?? ""));
  const longDescription =
    sanitizeAdminHtml(String(formData.get("longDescription") ?? "")) || null;
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const spiceNote = String(formData.get("spiceNote") ?? "") || null;
  const dietary = parseList(String(formData.get("dietary") ?? ""));
  const badge = String(formData.get("badge") ?? "") || null;
  const tagline = String(formData.get("tagline") ?? "") || null;
  const seoTitle = String(formData.get("seoTitle") ?? "") || null;
  const seoDescription = String(formData.get("seoDescription") ?? "") || null;
  const origin = String(formData.get("origin") ?? "") || null;
  const shelfLife = String(formData.get("shelfLife") ?? "") || null;
  const ingredients = parseList(String(formData.get("ingredients") ?? ""));
  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";
  const bestseller = formData.get("bestseller") === "on";
  const newArrival = formData.get("newArrival") === "on";

  const payload = {
    slug,
    name,
    description,
    long_description: longDescription,
    category_id: categoryId,
    spice_note: spiceNote,
    dietary,
    badge,
    tagline,
    seo_title: seoTitle,
    seo_description: seoDescription,
    origin,
    shelf_life: shelfLife,
    ingredients,
    published,
    featured,
    bestseller,
    new_arrival: newArrival,
    updated_at: new Date().toISOString(),
  };

  const admin = createAdminClient();
  let productId = id;

  if (id) {
    await admin.from("products").update(payload).eq("id", id);
  } else {
    const { data } = await admin
      .from("products")
      .insert(payload)
      .select("id")
      .single();
    productId = data?.id ?? "";
  }

  revalidateAdmin("/admin/products", `/admin/products/${productId}`, "/admin");
  if (productId) redirect(`/admin/products/${productId}`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();
  await admin.from("products").delete().eq("id", id);
  revalidateAdmin("/admin/products", "/admin");
}

export async function setProductPublishedAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  const admin = createAdminClient();
  await admin.from("products").update({ published }).eq("id", id);
  revalidateAdmin("/admin/products", `/admin/products/${id}`);
}

export async function duplicateProductAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();
  const { data: raw } = await admin
    .from("products")
    .select("*, product_variants(*), product_images(*)")
    .eq("id", id)
    .maybeSingle();

  type DupProduct = {
    slug: string;
    name: string;
    description: string;
    long_description: string | null;
    category_id: string | null;
    spice_note: string | null;
    dietary: string[] | null;
    badge: string | null;
    tagline: string | null;
    seo_title: string | null;
    seo_description: string | null;
    bestseller: boolean;
    new_arrival: boolean;
    origin: string | null;
    shelf_life: string | null;
    ingredients: string[] | null;
    product_variants: {
      label: string;
      sku: string;
      price_paise: number;
      mrp_paise: number | null;
      weight_g: number | null;
      stock_qty: number;
      low_stock_threshold: number;
      available: boolean;
      sort_order: number;
    }[] | null;
    product_images: {
      storage_path: string;
      alt: string | null;
      sort_order: number;
    }[] | null;
  };

  const product = raw as DupProduct | null;
  if (!product) return;

  const slug = `${product.slug}-copy-${Date.now().toString(36)}`;
  const { data: created } = await admin
    .from("products")
    .insert({
      slug,
      name: `${product.name} (Copy)`,
      description: product.description,
      long_description: product.long_description,
      category_id: product.category_id,
      spice_note: product.spice_note,
      dietary: product.dietary,
      badge: product.badge,
      tagline: product.tagline,
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      featured: false,
      bestseller: product.bestseller,
      new_arrival: product.new_arrival,
      origin: product.origin,
      shelf_life: product.shelf_life,
      ingredients: product.ingredients,
      published: false,
    })
    .select("id")
    .single();

  if (!created) return;

  const variants = product.product_variants ?? [];
  if (variants.length) {
    await admin.from("product_variants").insert(
      variants.map((v, i) => ({
        product_id: created.id,
        label: v.label,
        sku: `${v.sku}-COPY-${i}`,
        price_paise: v.price_paise,
        mrp_paise: v.mrp_paise,
        weight_g: v.weight_g,
        stock_qty: v.stock_qty,
        low_stock_threshold: v.low_stock_threshold,
        available: v.available,
        sort_order: v.sort_order,
      })),
    );
  }

  const images = product.product_images ?? [];
  if (images.length) {
    await admin.from("product_images").insert(
      images.map((img) => ({
        product_id: created.id,
        storage_path: img.storage_path,
        alt: img.alt,
        sort_order: img.sort_order,
      })),
    );
  }

  revalidateAdmin("/admin/products");
  redirect(`/admin/products/${created.id}`);
}

export async function saveVariantAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const payload = {
    product_id: productId,
    label: String(formData.get("label") ?? "").trim(),
    sku: String(formData.get("sku") ?? "").trim(),
    price_paise: moneyToPaise(formData.get("price")),
    mrp_paise: formData.get("mrp")
      ? moneyToPaise(formData.get("mrp"))
      : null,
    weight_g: formData.get("weightG")
      ? Number(formData.get("weightG"))
      : null,
    stock_qty: Number(formData.get("stockQty") ?? 0),
    low_stock_threshold: Number(formData.get("lowStockThreshold") ?? 5),
    available: formData.get("available") === "on",
    sort_order: Number(formData.get("sortOrder") ?? 0),
  };

  const admin = createAdminClient();
  if (id) {
    await admin.from("product_variants").update(payload).eq("id", id);
  } else {
    await admin.from("product_variants").insert(payload);
  }

  revalidateAdmin(
    "/admin/products",
    `/admin/products/${productId}`,
    "/admin/inventory",
  );
}

export async function deleteVariantAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const admin = createAdminClient();
  await admin.from("product_variants").delete().eq("id", id);
  revalidateAdmin(`/admin/products/${productId}`, "/admin/inventory");
}

export async function updateVariantStockAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const variantId = String(formData.get("variantId") ?? "");
  const stockQty = Number(formData.get("stockQty") ?? 0);
  const reason = String(formData.get("reason") ?? "manual_adjust");

  const admin = createAdminClient();
  const { data: current } = await admin
    .from("product_variants")
    .select("stock_qty")
    .eq("id", variantId)
    .maybeSingle();

  const prev = current?.stock_qty ?? 0;
  const delta = stockQty - prev;

  await admin
    .from("product_variants")
    .update({ stock_qty: stockQty })
    .eq("id", variantId);

  if (delta !== 0) {
    await admin.from("inventory_logs").insert({
      variant_id: variantId,
      delta,
      reason,
    });
  }

  revalidateAdmin("/admin/products", "/admin/inventory", "/admin");
}

export async function adjustInventoryAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const variantId = String(formData.get("variantId") ?? "");
  const delta = Number(formData.get("delta") ?? 0);
  const reason = String(formData.get("reason") ?? "manual_adjust");
  if (!variantId || !delta) return;

  const admin = createAdminClient();
  const { data: current } = await admin
    .from("product_variants")
    .select("stock_qty")
    .eq("id", variantId)
    .maybeSingle();

  const next = Math.max(0, (current?.stock_qty ?? 0) + delta);
  await admin
    .from("product_variants")
    .update({ stock_qty: next })
    .eq("id", variantId);
  await admin.from("inventory_logs").insert({
    variant_id: variantId,
    delta,
    reason,
  });

  revalidateAdmin("/admin/inventory", "/admin/products", "/admin");
}

export async function saveProductImageAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const storagePath = String(formData.get("storagePath") ?? "").trim();
  const alt = String(formData.get("alt") ?? "") || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  const admin = createAdminClient();
  if (id) {
    await admin
      .from("product_images")
      .update({ storage_path: storagePath, alt, sort_order: sortOrder })
      .eq("id", id);
  } else {
    await admin.from("product_images").insert({
      product_id: productId,
      storage_path: storagePath,
      alt,
      sort_order: sortOrder,
    });
  }

  revalidateAdmin(`/admin/products/${productId}`);
}

export async function deleteProductImageAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const admin = createAdminClient();
  await admin.from("product_images").delete().eq("id", id);
  revalidateAdmin(`/admin/products/${productId}`);
}

export async function reorderProductImagesAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const productId = String(formData.get("productId") ?? "");
  const orderRaw = String(formData.get("order") ?? "[]");
  const order = JSON.parse(orderRaw) as string[];
  const admin = createAdminClient();
  await Promise.all(
    order.map((imageId, index) =>
      admin
        .from("product_images")
        .update({ sort_order: index })
        .eq("id", imageId),
    ),
  );
  revalidateAdmin(`/admin/products/${productId}`);
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    redirect("/admin/categories?notice=supabase-required");
  }

  const id = String(formData.get("id") ?? "");
  const payload = {
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    subtitle: String(formData.get("subtitle") ?? "") || null,
    image_url: String(formData.get("imageUrl") ?? "") || null,
    sort_order: Number(formData.get("sortOrder") ?? 0),
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
    updated_at: new Date().toISOString(),
  };

  const admin = createAdminClient();
  if (id) {
    await admin.from("categories").update(payload).eq("id", id);
  } else {
    await admin.from("categories").insert(payload);
  }

  revalidateAdmin("/admin/categories", "/admin");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();
  const { count } = await admin
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if ((count ?? 0) > 0) {
    redirect("/admin/categories?error=has-products");
  }

  await admin.from("categories").delete().eq("id", id);
  revalidateAdmin("/admin/categories");
}

export async function setCategoryPublishedAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  const admin = createAdminClient();
  await admin.from("categories").update({ published }).eq("id", id);
  revalidateAdmin("/admin/categories", "/admin");
}

export async function setCategoryFeaturedAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const featured = formData.get("featured") === "true";
  const admin = createAdminClient();
  await admin.from("categories").update({ featured }).eq("id", id);
  revalidateAdmin("/admin/categories", "/admin");
}

export async function saveComboAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    redirect("/admin/combos?notice=supabase-required");
  }

  const id = String(formData.get("id") ?? "");
  const payload = {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "") || null,
    image_url: String(formData.get("imageUrl") ?? "") || null,
    sku: String(formData.get("sku") ?? "") || null,
    price_paise: moneyToPaise(formData.get("price")),
    mrp_paise: formData.get("mrp") ? moneyToPaise(formData.get("mrp")) : null,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    sort_order: Number(formData.get("sortOrder") ?? 0),
    updated_at: new Date().toISOString(),
  };

  const admin = createAdminClient();
  let comboId = id;
  if (id) {
    await admin.from("combos").update(payload).eq("id", id);
  } else {
    const { data } = await admin
      .from("combos")
      .insert(payload)
      .select("id")
      .single();
    comboId = data?.id ?? "";
  }

  const itemsRaw = String(formData.get("itemsJson") ?? "").trim();
  if (comboId && itemsRaw) {
    const items = JSON.parse(itemsRaw) as {
      productId?: string;
      variantId?: string;
      qty?: number;
    }[];
    await admin.from("combo_items").delete().eq("combo_id", comboId);
    if (items.length) {
      await admin.from("combo_items").insert(
        items.map((item, i) => ({
          combo_id: comboId,
          product_id: item.productId || null,
          variant_id: item.variantId || null,
          qty: item.qty ?? 1,
          sort_order: i,
        })),
      );
    }
  }

  revalidateAdmin("/admin/combos");
}

export async function deleteComboAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();
  await admin.from("combos").delete().eq("id", id);
  revalidateAdmin("/admin/combos");
}

export async function setComboPublishedAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  const admin = createAdminClient();
  await admin.from("combos").update({ published }).eq("id", id);
  revalidateAdmin("/admin/combos");
}

export async function setComboFeaturedAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const featured = formData.get("featured") === "true";
  const admin = createAdminClient();
  await admin.from("combos").update({ featured }).eq("id", id);
  revalidateAdmin("/admin/combos");
}

export async function saveContentBlockAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    redirect(
      `/admin/content/${String(formData.get("pageKey") ?? "home")}?notice=supabase-required`,
    );
  }

  const pageKey = String(formData.get("pageKey") ?? "");
  const sectionKey = String(formData.get("sectionKey") ?? "");
  const contentRaw = String(formData.get("content") ?? "{}");

  const admin = createAdminClient();
  await admin.from("content_blocks").upsert(
    {
      page_key: pageKey,
      section_key: sectionKey,
      content: JSON.parse(contentRaw),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page_key,section_key" },
  );

  revalidateAdmin(`/admin/content/${pageKey}`, "/");
}

export async function saveHomepageContentAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    redirect("/admin/content/home?notice=supabase-required");
  }

  const announcement = String(formData.get("announcement") ?? "");
  const celebrationTitle = String(formData.get("celebrationTitle") ?? "");
  const celebrationBody = String(formData.get("celebrationBody") ?? "");
  const slidesRaw = String(formData.get("heroSlidesJson") ?? "[]");

  const admin = createAdminClient();
  await Promise.all([
    admin.from("content_blocks").upsert(
      {
        page_key: "home",
        section_key: "announcement",
        content: { text: announcement },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page_key,section_key" },
    ),
    admin.from("content_blocks").upsert(
      {
        page_key: "home",
        section_key: "celebration",
        content: { title: celebrationTitle, body: celebrationBody },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page_key,section_key" },
    ),
    admin.from("content_blocks").upsert(
      {
        page_key: "home",
        section_key: "hero_slides",
        content: JSON.parse(slidesRaw),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page_key,section_key" },
    ),
  ]);

  revalidateAdmin("/admin/content/home", "/admin/content/carousels", "/");
}

export async function savePromiseContentAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    redirect("/admin/content/promise?notice=supabase-required");
  }

  const contentRaw = String(formData.get("content") ?? "{}");
  const admin = createAdminClient();
  await admin.from("content_blocks").upsert(
    {
      page_key: "promise",
      section_key: "hub_links",
      content: JSON.parse(contentRaw),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page_key,section_key" },
  );

  revalidateAdmin("/admin/content/promise");
}

export async function saveCarouselSlidesAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    redirect("/admin/content/carousels?notice=supabase-required");
  }

  const slidesRaw = String(formData.get("slidesJson") ?? "[]");
  const admin = createAdminClient();
  await admin.from("content_blocks").upsert(
    {
      page_key: "home",
      section_key: "hero_slides",
      content: JSON.parse(slidesRaw),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page_key,section_key" },
  );

  revalidateAdmin("/admin/content/carousels", "/admin/content/home", "/");
}

export async function updateEnquiryStatusAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "new") as EnquiryStatus;

  const admin = createAdminClient();
  await admin.from("enquiries").update({ status }).eq("id", id);
  revalidateAdmin("/admin/enquiries", "/admin");
}

export async function updateCustomerProfileAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", id)
    .maybeSingle();

  if (!profile || profile.role === "admin") return;

  await admin
    .from("profiles")
    .update({
      full_name: String(formData.get("fullName") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidateAdmin("/admin/customers", `/admin/customers/${id}`);
}

export async function saveOutletAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    redirect("/admin/outlets?notice=supabase-required");
  }

  const id = String(formData.get("id") ?? "");
  const payload = {
    name: String(formData.get("name") ?? ""),
    address: String(formData.get("address") ?? ""),
    phone: String(formData.get("phone") ?? "") || null,
    hours: String(formData.get("hours") ?? "") || null,
    lat: formData.get("lat") ? Number(formData.get("lat")) : null,
    lng: formData.get("lng") ? Number(formData.get("lng")) : null,
    sort_order: Number(formData.get("sortOrder") ?? 0),
    published: formData.get("published") === "on",
  };

  const admin = createAdminClient();
  if (id) {
    await admin.from("outlets").update(payload).eq("id", id);
  } else {
    await admin.from("outlets").insert(payload);
  }

  revalidateAdmin("/admin/outlets", "/admin");
}

export async function deleteOutletAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();
  await admin.from("outlets").delete().eq("id", id);
  revalidateAdmin("/admin/outlets");
}

export async function setOutletPublishedAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  const admin = createAdminClient();
  await admin.from("outlets").update({ published }).eq("id", id);
  revalidateAdmin("/admin/outlets", "/admin");
}

export async function saveMediaAssetAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const storagePath = String(formData.get("storagePath") ?? "").trim();
  const alt = String(formData.get("alt") ?? "") || null;
  const folder = String(formData.get("folder") ?? "") || null;
  const user = await requireAdmin();

  const admin = createAdminClient();
  await admin.from("media_assets").insert({
    storage_path: storagePath,
    alt,
    folder,
    uploaded_by: user.id === "dev-admin" ? null : user.id,
  });

  revalidateAdmin("/admin/media");
}

export async function deleteMediaAssetAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();
  await admin.from("media_assets").delete().eq("id", id);
  revalidateAdmin("/admin/media");
}
