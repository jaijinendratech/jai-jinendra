"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import type { EnquiryStatus, OrderStatus, PaymentStatus } from "@/types/database";
import { slugify } from "@/lib/admin/slug";

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

async function uniqueCategorySlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const admin = createAdminClient();
  const base = slugify(title) || "category";
  let candidate = base;
  let n = 2;

  for (;;) {
    let query = admin.from("categories").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

async function uniqueProductSlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const admin = createAdminClient();
  const base = slugify(name) || "product";
  let candidate = base;
  let n = 2;

  for (;;) {
    let query = admin.from("products").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

async function uniqueComboSlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const admin = createAdminClient();
  const base = slugify(name) || "combo";
  let candidate = base;
  let n = 2;

  for (;;) {
    let query = admin.from("combos").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

async function uniqueVariantSku(
  productSlug: string,
  label: string,
  excludeId?: string,
): Promise<string> {
  const admin = createAdminClient();
  const labelSlug = slugify(label) || "var";
  const base = `JJ-${slugify(productSlug) || "product"}-${labelSlug}`.toUpperCase();
  let candidate = base;
  let n = 2;

  for (;;) {
    let query = admin
      .from("product_variants")
      .select("id")
      .eq("sku", candidate)
      .limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

async function uniqueComboSku(
  name: string,
  excludeId?: string,
): Promise<string> {
  const admin = createAdminClient();
  const base = `JJ-COMBO-${slugify(name) || "pack"}`.toUpperCase();
  let candidate = base;
  let n = 2;

  for (;;) {
    let query = admin.from("combos").select("id").eq("sku", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
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

/** Create Shiprocket shipment for a paid/COD order (admin-triggered). */
export async function createShiprocketShipmentAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is required for Shiprocket.");
  }

  const {
    createShiprocketShipment,
    isShiprocketConfigured,
  } = await import("@/lib/shiprocket");

  if (!isShiprocketConfigured()) {
    throw new Error(
      "Shiprocket is not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD.",
    );
  }

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Missing order id.");

  type OrderShipRow = {
    id: string;
    order_number: string;
    created_at: string;
    payment_method: string;
    subtotal_paise: number;
    customer_phone: string | null;
    customer_email: string | null;
    status: OrderStatus;
    shipment_id: string | null;
    awb_code: string | null;
    address_snapshot: Record<string, string | undefined> | null;
    order_items: {
      name_snapshot: string;
      sku_snapshot: string | null;
      qty: number;
      unit_price_paise: number;
    }[] | null;
  };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) throw new Error("Order not found.");
  const row = data as unknown as OrderShipRow;

  if (row.shipment_id || row.awb_code) {
    throw new Error(
      "This order already has a shipment. Clear AWB/shipment fields first to recreate.",
    );
  }

  const addr = (row.address_snapshot ?? {}) as {
    name?: string;
    phone?: string;
    email?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  const items = (row.order_items ?? []).map(
    (item: {
      name_snapshot: string;
      sku_snapshot: string | null;
      qty: number;
      unit_price_paise: number;
    }) => ({
      name: item.name_snapshot,
      sku: item.sku_snapshot || "ITEM",
      units: item.qty,
      sellingPriceRupees: item.unit_price_paise / 100,
    }),
  );

  const result = await createShiprocketShipment({
    orderNumber: row.order_number,
    orderDate: row.created_at,
    paymentMethod: row.payment_method,
    subtotalRupees: row.subtotal_paise / 100,
    address: {
      name: addr.name || "Customer",
      phone: row.customer_phone || addr.phone || "",
      email: row.customer_email || addr.email,
      line1: addr.line1 || "",
      line2: addr.line2,
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
    },
    items,
  });

  await admin
    .from("orders")
    .update({
      shipment_id: result.shipmentId,
      awb_code: result.awbCode,
      courier_name: result.courierName,
      tracking_url: result.trackingUrl,
      shipping_status: result.shippingStatus,
      status:
        row.status === "pending_payment" || row.status === "cancelled"
          ? row.status
          : "dispatched",
    })
    .eq("id", orderId);

  revalidateAdmin(
    "/admin/orders",
    `/admin/orders/${orderId}`,
    `/admin/orders/${row.order_number}`,
  );
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    redirect("/admin/products?notice=supabase-required");
  }

  const { sanitizeAdminHtml } = await import("@/lib/sanitize-html");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Name is required.");
  }
  const slug = await uniqueProductSlug(name, id || undefined);
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

  const returnTo = String(formData.get("returnTo") ?? "");
  // Modal CRUD: return id so the client can stay on the list and open Edit after create.
  if (returnTo === "modal") {
    return { ok: true as const, productId, created: !id };
  }
  if (returnTo === "list") {
    redirect("/admin/products?notice=saved");
  }
  if (productId) redirect(`/admin/products/${productId}`);
  return { ok: true as const, productId, created: !id };
}

/** Load a product for the admin edit modal (client-callable). */
export async function loadAdminProductAction(id: string) {
  await requireAdmin();
  const { getAdminProductById } = await import("@/lib/admin/queries");
  return getAdminProductById(id);
}

/** Load a customer + orders for the admin detail drawer (client-callable). */
export async function loadAdminCustomerAction(id: string) {
  await requireAdmin();
  const { getAdminCustomerById, getAdminCustomerOrders } = await import(
    "@/lib/admin/queries"
  );
  const customer = await getAdminCustomerById(id);
  if (!customer) return null;
  const orders = await getAdminCustomerOrders(customer.id, customer.email);
  return { customer, orders };
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
  const label = String(formData.get("label") ?? "").trim();
  const admin = createAdminClient();

  const { data: product } = await admin
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  const productSlug = product?.slug ?? "product";

  // Keep existing SKU on edit so order line snapshots stay stable.
  let sku = String(formData.get("sku") ?? "").trim();
  if (id) {
    const { data: existing } = await admin
      .from("product_variants")
      .select("sku")
      .eq("id", id)
      .maybeSingle();
    sku = existing?.sku ?? sku;
  } else {
    sku = await uniqueVariantSku(productSlug, label);
  }

  const payload = {
    product_id: productId,
    label,
    sku,
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
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    throw new Error("Title is required.");
  }

  const slug = await uniqueCategorySlug(title, id || undefined);

  const payload = {
    slug,
    title,
    subtitle: String(formData.get("subtitle") ?? "") || null,
    image_url: String(formData.get("imageUrl") ?? "") || null,
    sort_order: Number(formData.get("sortOrder") ?? 0),
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
    updated_at: new Date().toISOString(),
  };

  const admin = createAdminClient();
  if (id) {
    const { error } = await admin.from("categories").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from("categories").insert(payload);
    if (error) throw new Error(error.message);
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
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Name is required.");
  }

  const slug = await uniqueComboSlug(name, id || undefined);
  const admin = createAdminClient();

  // Keep existing SKU on edit; generate only on create.
  let sku: string | null = null;
  if (id) {
    const { data: existing } = await admin
      .from("combos")
      .select("sku")
      .eq("id", id)
      .maybeSingle();
    sku = existing?.sku ?? null;
  } else {
    sku = await uniqueComboSku(name);
  }

  const payload = {
    slug,
    name,
    description: String(formData.get("description") ?? "") || null,
    image_url: String(formData.get("imageUrl") ?? "") || null,
    sku,
    price_paise: moneyToPaise(formData.get("price")),
    mrp_paise: formData.get("mrp") ? moneyToPaise(formData.get("mrp")) : null,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    sort_order: Number(formData.get("sortOrder") ?? 0),
    updated_at: new Date().toISOString(),
  };

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
  ]);

  revalidateAdmin("/admin/content/home", "/");
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

  const pageKey = String(formData.get("pageKey") ?? "home").trim() || "home";
  const slidesRaw = String(formData.get("slidesJson") ?? "[]");
  const admin = createAdminClient();
  await admin.from("content_blocks").upsert(
    {
      page_key: pageKey,
      section_key: "hero_slides",
      content: JSON.parse(slidesRaw),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page_key,section_key" },
  );

  const storefrontPath =
    pageKey === "home"
      ? "/"
      : pageKey === "kachoris"
        ? "/kachoris"
        : `/${pageKey}`;

  revalidateAdmin(
    "/admin/content/carousels",
    "/admin/content/home",
    storefrontPath,
  );
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

  revalidateAdmin("/admin/customers");
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
