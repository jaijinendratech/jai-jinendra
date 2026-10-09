import { cookies } from "next/headers";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/catalog/placeholder";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { CART_SESSION_COOKIE } from "@/lib/cart/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { calculateOrderTotals } from "@/lib/shipping";

export type CartLine = {
  id: string;
  variantId: string;
  sku: string;
  qty: number;
  label: string;
  productName: string;
  productSlug: string;
  image: string;
  unitPricePaise: number;
  stockQty: number;
  lineTotalPaise: number;
};

export type CartSummary = {
  items: CartLine[];
  itemCount: number;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  totalPaise: number;
  warnings: string[];
};

async function getOrCreateSessionId(): Promise<string> {
  const jar = await cookies();
  let sessionId = jar.get(CART_SESSION_COOKIE)?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    jar.set(CART_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production",
    });
  }
  return sessionId;
}

async function resolveCartId(
  admin: ReturnType<typeof createAdminClient>,
  userId: string | null,
  sessionId: string | null,
): Promise<string> {
  if (userId) {
    const { data: existing } = await admin
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      // Merge a guest session cart into the user cart, only when a guest
      // session cookie exists (otherwise there is nothing to look up).
      const { data: sessionCart } = sessionId
        ? await admin
            .from("carts")
            .select("id")
            .eq("session_id", sessionId)
            .maybeSingle()
        : { data: null };

      if (sessionCart && sessionCart.id !== existing.id) {
        const { data: sessionItems } = await admin
          .from("cart_items")
          .select("variant_id, qty")
          .eq("cart_id", sessionCart.id);

        if (sessionItems?.length) {
          await admin.from("cart_items").upsert(
            sessionItems.map((item) => ({
              cart_id: existing.id,
              variant_id: item.variant_id,
              qty: item.qty,
            })),
            { onConflict: "cart_id,variant_id" },
          );
        }
        await admin.from("carts").delete().eq("id", sessionCart.id);
      }

      return existing.id;
    }

    const { data: created, error } = await admin
      .from("carts")
      .insert({ user_id: userId })
      .select("id")
      .single();
    if (error) throw error;
    return created.id;
  }

  if (!sessionId) throw new Error("Cart session missing");

  const { data: existing } = await admin
    .from("carts")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await admin
    .from("carts")
    .insert({ session_id: sessionId })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

/**
 * Resolve who is shopping once per request: the signed-in user (if any) and
 * the cart they own. Callers reuse this instead of repeating auth + lookups.
 */
async function resolveCartContext(
  admin: ReturnType<typeof createAdminClient>,
): Promise<{ cartId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const jar = await cookies();
  const existingSession = jar.get(CART_SESSION_COOKIE)?.value ?? null;
  // Guests need a session cookie; signed-in users only have one if they
  // shopped as a guest before logging in.
  const sessionId = user
    ? existingSession
    : (existingSession ?? (await getOrCreateSessionId()));
  const cartId = await resolveCartId(admin, user?.id ?? null, sessionId);
  return { cartId };
}

export async function getCartSummary(): Promise<CartSummary> {
  if (!isSupabaseConfigured()) {
    return emptyCart();
  }

  const admin = createAdminClient();
  const { cartId } = await resolveCartContext(admin);
  return loadCartSummary(admin, cartId);
}

async function loadCartSummary(
  admin: ReturnType<typeof createAdminClient>,
  cartId: string,
): Promise<CartSummary> {
  const { data: rows, error } = await admin
    .from("cart_items")
    .select(
      `
      id, qty, variant_id,
      product_variants (
        id, label, sku, price_paise, stock_qty,
        products ( slug, name, product_images ( storage_path, sort_order ) )
      )
    `,
    )
    .eq("cart_id", cartId);

  if (error) throw error;

  const warnings: string[] = [];
  type CartRow = {
    id: string;
    qty: number;
    product_variants: {
      id: string;
      label: string;
      sku: string;
      price_paise: number;
      stock_qty: number;
      products: {
        slug: string;
        name: string;
        product_images: { storage_path: string; sort_order: number }[];
      };
    };
  };

  const items: CartLine[] = ((rows ?? []) as unknown as CartRow[]).map((row) => {
    const variant = row.product_variants;

    const images = [...(variant.products.product_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    const image = images[0]?.storage_path ?? PRODUCT_PLACEHOLDER_IMAGE;

    if (row.qty > variant.stock_qty) {
      warnings.push(
        `${variant.products.name} (${variant.label}): only ${variant.stock_qty} in stock`,
      );
    }

    return {
      id: row.id,
      variantId: variant.id,
      sku: variant.sku,
      qty: row.qty,
      label: variant.label,
      productName: variant.products.name,
      productSlug: variant.products.slug,
      image,
      unitPricePaise: variant.price_paise,
      stockQty: variant.stock_qty,
      lineTotalPaise: variant.price_paise * row.qty,
    };
  });

  const subtotalPaise = items.reduce((s, i) => s + i.lineTotalPaise, 0);
  const totals = calculateOrderTotals(subtotalPaise);

  return {
    items,
    itemCount: items.reduce((s, i) => s + i.qty, 0),
    subtotalPaise: totals.subtotalPaise,
    discountPaise: totals.discountPaise,
    shippingPaise: totals.shippingPaise,
    totalPaise: totals.totalPaise,
    warnings,
  };
}

function emptyCart(): CartSummary {
  return {
    items: [],
    itemCount: 0,
    subtotalPaise: 0,
    discountPaise: 0,
    shippingPaise: 0,
    totalPaise: 0,
    warnings: [],
  };
}

export async function upsertCartItem(input: {
  sku?: string;
  variantId?: string;
  qty: number;
}) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }
  if (!input.variantId && !input.sku) {
    throw new Error("variantId or sku required");
  }

  const admin = createAdminClient();

  // Auth/cart resolution and the variant lookup are independent: run together.
  const variantQuery = admin
    .from("product_variants")
    .select("id, stock_qty");
  const [{ cartId }, { data: variant }] = await Promise.all([
    resolveCartContext(admin),
    input.variantId
      ? variantQuery.eq("id", input.variantId).maybeSingle()
      : variantQuery.eq("sku", input.sku!).maybeSingle(),
  ]);

  if (!variant) throw new Error("Variant not found");
  const variantId = variant.id;

  if (input.qty <= 0) {
    await admin
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId)
      .eq("variant_id", variantId);
    return loadCartSummary(admin, cartId);
  }

  if (input.qty > variant.stock_qty) {
    throw new Error(`Only ${variant.stock_qty} available`);
  }

  // The timestamp bump is bookkeeping: write it alongside, don't serialise.
  const [{ error: upsertError }] = await Promise.all([
    admin
      .from("cart_items")
      .upsert(
        { cart_id: cartId, variant_id: variantId, qty: input.qty },
        { onConflict: "cart_id,variant_id" },
      ),
    admin
      .from("carts")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", cartId),
  ]);
  if (upsertError) throw upsertError;

  return loadCartSummary(admin, cartId);
}

export async function clearCart() {
  if (!isSupabaseConfigured()) return;
  const admin = createAdminClient();
  const { cartId } = await resolveCartContext(admin);
  await admin.from("cart_items").delete().eq("cart_id", cartId);
}

/** Clear cart by user id (webhook / payment success, no cookie session). */
export async function clearCartForUser(userId: string) {
  if (!isSupabaseConfigured() || !userId) return;
  const admin = createAdminClient();
  const { data: cart } = await admin
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!cart) return;
  await admin.from("cart_items").delete().eq("cart_id", cart.id);
}
