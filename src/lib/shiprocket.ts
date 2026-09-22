import { getEnv, isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE = "https://apiv2.shiprocket.in/v1/external";

type TokenCache = { token: string; expiresAt: number };
let memoryToken: TokenCache | null = null;

export type ShiprocketAddress = {
  name: string;
  phone: string;
  email?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type ShiprocketOrderItem = {
  name: string;
  sku: string;
  units: number;
  sellingPriceRupees: number;
};

export type ShiprocketCreateResult = {
  shiprocketOrderId: number | string | null;
  shipmentId: string;
  awbCode: string | null;
  courierName: string | null;
  trackingUrl: string | null;
  shippingStatus: string;
  raw: unknown;
};

function credentials() {
  const email = getEnv("SHIPROCKET_EMAIL", true)!;
  const password = getEnv("SHIPROCKET_PASSWORD", true)!;
  const pickupLocation =
    getEnv("SHIPROCKET_PICKUP_LOCATION")?.trim() || "Primary";
  return { email, password, pickupLocation };
}

export function isShiprocketConfigured(): boolean {
  return Boolean(
    process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD,
  );
}

async function shiprocketFetch<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, { ...rest, headers });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" &&
      data &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Shiprocket ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

async function loadStoredToken(): Promise<TokenCache | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("integration_tokens")
      .select("token, expires_at")
      .eq("provider", "shiprocket")
      .maybeSingle();
    if (!data?.token || !data.expires_at) return null;
    const expiresAt = new Date(data.expires_at).getTime();
    if (expiresAt <= Date.now() + 60_000) return null;
    return { token: data.token, expiresAt };
  } catch {
    return null;
  }
}

async function persistToken(cache: TokenCache) {
  memoryToken = cache;
  if (!isSupabaseConfigured()) return;
  try {
    const admin = createAdminClient();
    await admin.from("integration_tokens").upsert(
      {
        provider: "shiprocket",
        token: cache.token,
        expires_at: new Date(cache.expiresAt).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider" },
    );
  } catch {
    // best-effort shared store
  }
}

export async function getShiprocketToken(force = false): Promise<string> {
  if (
    !force &&
    memoryToken &&
    memoryToken.expiresAt > Date.now() + 60_000
  ) {
    return memoryToken.token;
  }

  if (!force) {
    const stored = await loadStoredToken();
    if (stored) {
      memoryToken = stored;
      return stored.token;
    }
  }

  const { email, password } = credentials();
  const data = await shiprocketFetch<{ token?: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!data?.token) {
    throw new Error("Shiprocket login did not return a token.");
  }

  const cache = {
    token: data.token,
    expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000,
  };
  await persistToken(cache);
  return cache.token;
}

type PickupListResponse = {
  data?: {
    shipping_address?: { pickup_location?: string; id?: number }[];
  };
};

/** Resolve configured pickup nickname, falling back to first warehouse. */
export async function resolvePickupLocation(token: string): Promise<string> {
  const preferred = credentials().pickupLocation;
  try {
    const list = await shiprocketFetch<PickupListResponse>(
      "/settings/company/pickup",
      { method: "GET", token },
    );
    const addresses = list?.data?.shipping_address ?? [];
    if (addresses.length === 0) return preferred;

    const exact = addresses.find(
      (a) =>
        a.pickup_location?.toLowerCase() === preferred.toLowerCase(),
    );
    if (exact?.pickup_location) return exact.pickup_location;

    const partial = addresses.find((a) =>
      a.pickup_location
        ?.toLowerCase()
        .includes(preferred.toLowerCase().slice(0, 12)),
    );
    if (partial?.pickup_location) return partial.pickup_location;

    return addresses[0]?.pickup_location || preferred;
  } catch {
    return preferred;
  }
}

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "Customer", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function formatOrderDate(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type AdhocCreateResponse = {
  order_id?: number | string;
  shipment_id?: number | string;
  status?: string;
  status_code?: number;
  onboarding_completed_now?: number;
  awb_code?: string | null;
  courier_name?: string | null;
};

type AssignAwbResponse = {
  response?: {
    data?: {
      awb_code?: string;
      courier_name?: string;
      courier_company_id?: number;
    };
  };
  awb_assign_error?: string;
  message?: string;
};

/**
 * Create a Shiprocket adhoc order and attempt AWB assignment.
 * Admin-triggered only — does not auto-run on payment.
 */
export async function createShiprocketShipment(params: {
  orderNumber: string;
  orderDate?: string | null;
  paymentMethod: "razorpay" | "cod" | string;
  subtotalRupees: number;
  address: ShiprocketAddress;
  items: ShiprocketOrderItem[];
  /** Optional package defaults (cm / kg). */
  lengthCm?: number;
  breadthCm?: number;
  heightCm?: number;
  weightKg?: number;
}): Promise<ShiprocketCreateResult> {
  if (!params.items.length) {
    throw new Error("Order has no items to ship.");
  }

  const token = await getShiprocketToken();
  const pickup = await resolvePickupLocation(token);
  const { first, last } = splitName(params.address.name);
  const phone = params.address.phone.replace(/\D/g, "").slice(-10);
  if (phone.length !== 10) {
    throw new Error("Customer phone must be a valid 10-digit Indian mobile.");
  }

  const payload = {
    order_id: params.orderNumber.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 50),
    order_date: formatOrderDate(params.orderDate),
    pickup_location: pickup,
    billing_customer_name: first,
    billing_last_name: last || first,
    billing_address: params.address.line1,
    billing_address_2: params.address.line2 || "",
    billing_city: params.address.city,
    billing_pincode: params.address.pincode,
    billing_state: params.address.state,
    billing_country: "India",
    billing_email: params.address.email || "orders@jaijinendra.com",
    billing_phone: phone,
    shipping_is_billing: true,
    order_items: params.items.map((item) => ({
      name: item.name.slice(0, 200),
      sku: (item.sku || "ITEM").slice(0, 50),
      units: item.units,
      selling_price: String(Math.max(1, Math.round(item.sellingPriceRupees))),
    })),
    payment_method: params.paymentMethod === "cod" ? "COD" : "Prepaid",
    sub_total: Math.max(1, Math.round(params.subtotalRupees)),
    length: params.lengthCm ?? 20,
    breadth: params.breadthCm ?? 15,
    height: params.heightCm ?? 10,
    weight: params.weightKg ?? 0.5,
  };

  const created = await shiprocketFetch<AdhocCreateResponse>(
    "/orders/create/adhoc",
    {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    },
  );

  const shipmentId = created.shipment_id;
  if (shipmentId == null || shipmentId === "") {
    throw new Error(
      "Shiprocket created the order but returned no shipment_id.",
    );
  }

  let awbCode = created.awb_code ?? null;
  let courierName = created.courier_name ?? null;

  if (!awbCode) {
    try {
      const assigned = await shiprocketFetch<AssignAwbResponse>(
        "/courier/assign/awb",
        {
          method: "POST",
          token,
          body: JSON.stringify({ shipment_id: shipmentId }),
        },
      );
      awbCode = assigned.response?.data?.awb_code ?? null;
      courierName = assigned.response?.data?.courier_name ?? courierName;
      if (assigned.awb_assign_error && !awbCode) {
        // Order exists; admin can assign courier in Shiprocket panel.
        console.warn(
          "[shiprocket] AWB assign:",
          assigned.awb_assign_error || assigned.message,
        );
      }
    } catch (err) {
      console.warn(
        "[shiprocket] AWB assign failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  const trackingUrl = awbCode
    ? `https://shiprocket.co/tracking/${awbCode}`
    : null;

  return {
    shiprocketOrderId: created.order_id ?? null,
    shipmentId: String(shipmentId),
    awbCode,
    courierName,
    trackingUrl,
    shippingStatus: awbCode ? "awb_assigned" : "created",
    raw: created,
  };
}
