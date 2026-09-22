import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { mockOrders, mockEnquiries, mockMediaAssets } from "@/data/admin-mock";
import { catalogueProducts } from "@/data/catalogue";
import { categories as homeCategories, heroSlides } from "@/data/home";
import { flagshipOutlets } from "@/data/promise-pages";
import {
  comboBoxSizes,
  comboBuilderPoolIds,
  comboBuilderHeroSlides,
} from "@/data/combo-builder";
import {
  sweetsPage,
  kachorisPage,
  hampersPage,
} from "@/data/experience-pages";
import type {
  EnquiryStatus,
  OrderStatus,
  PaymentStatus,
} from "@/types/database";

export type CarouselPageKey =
  | "home"
  | "sweets"
  | "kachoris"
  | "hampers"
  | "combos";

export const CAROUSEL_PAGE_KEYS: {
  key: CarouselPageKey;
  label: string;
}[] = [
  { key: "home", label: "Home page carousel" },
  { key: "sweets", label: "Sweets page carousel" },
  { key: "kachoris", label: "Kachori page carousel" },
  { key: "hampers", label: "Hamper page carousel" },
  { key: "combos", label: "Combo pack carousel" },
];

function staticCarouselFallback(pageKey: CarouselPageKey) {
  if (pageKey === "sweets") {
    return sweetsPage.slides.map((s) => ({
      id: s.id,
      src: s.src,
      alt: s.alt,
    }));
  }
  if (pageKey === "kachoris") {
    return kachorisPage.slides.map((s) => ({
      id: s.id,
      src: s.src,
      alt: s.alt,
    }));
  }
  if (pageKey === "hampers") {
    return hampersPage.slides.map((s) => ({
      id: s.id,
      src: s.src,
      alt: s.alt,
    }));
  }
  if (pageKey === "combos") {
    return comboBuilderHeroSlides.map((s) => ({
      id: s.id,
      src: s.src,
      alt: s.alt,
    }));
  }
  return heroSlides.map((s) => ({ id: s.id, src: s.src, alt: s.alt }));
}

export type AdminOrderListItem = {
  id: string;
  dbId: string;
  customer: string;
  email: string;
  phone: string;
  city: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  placedAt: string;
  itemCount: number;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  orderCount: number;
  spent: number;
  createdAt: string;
};

export type AdminProductListItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryId: string | null;
  price: number;
  image: string | null;
  variantCount: number;
  stockQty: number;
  published: boolean;
  featured: boolean;
  rating: number;
};

export type AdminProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string | null;
  categoryId: string | null;
  categorySlug: string;
  subcategoryId: string | null;
  sourceName: string | null;
  spiceNote: string | null;
  dietary: string[];
  badge: string | null;
  tagline: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  seasonal: boolean;
  origin: string | null;
  shelfLife: string | null;
  ingredients: string[];
  published: boolean;
  variants: {
    id: string;
    label: string;
    sku: string;
    pricePaise: number;
    mrpPaise: number | null;
    weightG: number | null;
    sellingUnit: string;
    quantityValue: number | null;
    stockQty: number;
    lowStockThreshold: number;
    available: boolean;
    sortOrder: number;
  }[];
  images: {
    id: string;
    storagePath: string;
    alt: string | null;
    sortOrder: number;
  }[];
};

export type AdminSubcategoryRow = {
  id: string;
  categoryId: string;
  categoryTitle: string;
  slug: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  sortOrder: number;
  published: boolean;
  productCount: number;
};

export type DashboardKpis = {
  revenueTotal: number;
  revenueToday: number;
  revenueMonth: number;
  ordersTotal: number;
  ordersToday: number;
  ordersPending: number;
  ordersCompleted: number;
  ordersCancelled: number;
  productsTotal: number;
  productsActive: number;
  productsLowStock: number;
  customers: number;
  enquiriesPending: number;
  enquiriesCorporate: number;
  outlets: number;
};

export type SeriesPoint = { date: string; value: number };
export type NamedCount = { name: string; value: number };

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toISOString().slice(0, 10);
}

function mockStatusToOrder(status: string): OrderStatus {
  if (status === "pending") return "pending_payment";
  if (status === "confirmed") return "confirmed";
  if (status === "dispatched") return "dispatched";
  if (status === "delivered") return "delivered";
  if (status === "cancelled") return "cancelled";
  return "confirmed";
}

function computeMockKpis(): DashboardKpis {
  const today = startOfDay();
  const month = startOfMonth();
  const orders = mockOrders;
  const revenueTotal = orders.reduce((s, o) => s + o.total, 0);
  const revenueToday = orders
    .filter((o) => new Date(o.placedAt) >= today)
    .reduce((s, o) => s + o.total, 0);
  const revenueMonth = orders
    .filter((o) => new Date(o.placedAt) >= month)
    .reduce((s, o) => s + o.total, 0);
  const ordersToday = orders.filter((o) => new Date(o.placedAt) >= today).length;
  const pending = orders.filter((o) =>
    ["pending", "confirmed"].includes(o.status),
  ).length;
  const completed = orders.filter((o) => o.status === "delivered").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const lowStock = catalogueProducts.filter((p) =>
    p.variants.some((v) => (v.stockQty ?? 20) <= 5),
  ).length;

  return {
    revenueTotal,
    revenueToday,
    revenueMonth,
    ordersTotal: orders.length,
    ordersToday,
    ordersPending: pending,
    ordersCompleted: completed,
    ordersCancelled: cancelled,
    productsTotal: catalogueProducts.length,
    productsActive: catalogueProducts.length,
    productsLowStock: lowStock || 4,
    customers: new Set(orders.map((o) => o.email)).size,
    enquiriesPending: mockEnquiries.filter((e) => e.status === "new").length,
    enquiriesCorporate: mockEnquiries.length,
    outlets: flagshipOutlets.length,
  };
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  if (!isSupabaseConfigured()) return computeMockKpis();

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("admin_dashboard_kpis");

  if (error || !data) {
    // Fallback: lightweight counts only (no full order dump)
    const [
      { count: ordersTotal },
      { count: productsTotal },
      { count: productsActive },
      { count: customers },
      { count: outlets },
    ] = await Promise.all([
      admin.from("orders").select("*", { count: "exact", head: true }),
      admin.from("products").select("*", { count: "exact", head: true }),
      admin
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("published", true),
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("outlets").select("*", { count: "exact", head: true }),
    ]);

    return {
      revenueTotal: 0,
      revenueToday: 0,
      revenueMonth: 0,
      ordersTotal: ordersTotal ?? 0,
      ordersToday: 0,
      ordersPending: 0,
      ordersCompleted: 0,
      ordersCancelled: 0,
      productsTotal: productsTotal ?? 0,
      productsActive: productsActive ?? 0,
      productsLowStock: 0,
      customers: customers ?? 0,
      enquiriesPending: 0,
      enquiriesCorporate: 0,
      outlets: outlets ?? 0,
    };
  }

  const k = data as Record<string, number>;
  return {
    revenueTotal: Number(k.revenue_total_paise ?? 0) / 100,
    revenueToday: Number(k.revenue_today_paise ?? 0) / 100,
    revenueMonth: Number(k.revenue_month_paise ?? 0) / 100,
    ordersTotal: Number(k.orders_total ?? 0),
    ordersToday: Number(k.orders_today ?? 0),
    ordersPending: Number(k.orders_pending ?? 0),
    ordersCompleted: Number(k.orders_completed ?? 0),
    ordersCancelled: Number(k.orders_cancelled ?? 0),
    productsTotal: Number(k.products_total ?? 0),
    productsActive: Number(k.products_active ?? 0),
    productsLowStock: Number(k.products_low_stock ?? 0),
    customers: Number(k.customers ?? 0),
    enquiriesPending: Number(k.enquiries_pending ?? 0),
    enquiriesCorporate: Number(k.enquiries_corporate ?? 0),
    outlets: Number(k.outlets ?? 0),
  };
}

function buildSeriesFromOrders(
  orders: { placedAt: string; total: number }[],
  days: number,
  mode: "revenue" | "orders",
): SeriesPoint[] {
  const start = daysAgo(days - 1);
  const map = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    map.set(dateKey(d), 0);
  }
  for (const o of orders) {
    const key = dateKey(o.placedAt);
    if (!map.has(key)) continue;
    map.set(key, (map.get(key) ?? 0) + (mode === "revenue" ? o.total : 1));
  }
  return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
}

export async function getRevenueSeries(days = 14): Promise<SeriesPoint[]> {
  if (!isSupabaseConfigured()) {
    return buildSeriesFromOrders(
      mockOrders.map((o) => ({ placedAt: o.placedAt, total: o.total })),
      days,
      "revenue",
    );
  }
  const admin = createAdminClient();
  const since = daysAgo(days - 1).toISOString();
  const { data } = await admin
    .from("orders")
    .select("total_paise, created_at")
    .gte("created_at", since);
  return buildSeriesFromOrders(
    (data ?? []).map((o) => ({
      placedAt: o.created_at,
      total: o.total_paise / 100,
    })),
    days,
    "revenue",
  );
}

export async function getOrderSeries(days = 14): Promise<SeriesPoint[]> {
  if (!isSupabaseConfigured()) {
    return buildSeriesFromOrders(
      mockOrders.map((o) => ({ placedAt: o.placedAt, total: o.total })),
      days,
      "orders",
    );
  }
  const admin = createAdminClient();
  const since = daysAgo(days - 1).toISOString();
  const { data } = await admin
    .from("orders")
    .select("created_at, total_paise")
    .gte("created_at", since);
  return buildSeriesFromOrders(
    (data ?? []).map((o) => ({
      placedAt: o.created_at,
      total: o.total_paise / 100,
    })),
    days,
    "orders",
  );
}

export async function getOrderStatusDistribution(): Promise<NamedCount[]> {
  if (!isSupabaseConfigured()) {
    const map = new Map<string, number>();
    for (const o of mockOrders) {
      const s = mockStatusToOrder(o.status);
      map.set(s, (map.get(s) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }
  const admin = createAdminClient();
  const { data } = await admin.from("orders").select("status");
  const map = new Map<string, number>();
  for (const o of data ?? []) {
    map.set(o.status, (map.get(o.status) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export async function getCategoryDistribution(): Promise<NamedCount[]> {
  if (!isSupabaseConfigured()) {
    const map = new Map<string, number>();
    for (const p of catalogueProducts) {
      const cat = String(p.category);
      map.set(cat, (map.get(cat) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("categories(title, slug)");
  type Row = { categories: { title: string; slug: string } | null };
  const map = new Map<string, number>();
  for (const p of (data ?? []) as unknown as Row[]) {
    const name = p.categories?.title ?? p.categories?.slug ?? "Uncategorized";
    map.set(name, (map.get(name) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export async function getTopProducts(limit = 5) {
  if (!isSupabaseConfigured()) {
    return catalogueProducts
      .slice()
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sold: p.reviewCount,
        revenue: p.price * Math.max(1, Math.floor(p.reviewCount / 10)),
        image: p.image,
      }));
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("order_items")
    .select("name_snapshot, qty, unit_price_paise, variant_id");
  const map = new Map<
    string,
    { name: string; sold: number; revenue: number }
  >();
  for (const item of data ?? []) {
    const key = item.name_snapshot;
    const cur = map.get(key) ?? { name: key, sold: 0, revenue: 0 };
    cur.sold += item.qty;
    cur.revenue += (item.unit_price_paise * item.qty) / 100;
    map.set(key, cur);
  }
  return Array.from(map.values())
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit)
    .map((p, i) => ({
      id: `top-${i}`,
      name: p.name,
      slug: "",
      sold: p.sold,
      revenue: p.revenue,
      image: null as string | null,
    }));
}

export async function getLowStockItems(limit = 10) {
  if (!isSupabaseConfigured()) {
    return catalogueProducts
      .flatMap((p) =>
        p.variants.map((v) => ({
          id: v.id,
          productName: p.name,
          label: v.label,
          sku: v.sku ?? v.id,
          stockQty: v.stockQty ?? 8,
          threshold: 5,
        })),
      )
      .filter((v) => v.stockQty <= 5)
      .slice(0, limit);
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("product_variants")
    .select(
      "id, label, sku, stock_qty, low_stock_threshold, products(name)",
    )
    .order("stock_qty", { ascending: true })
    .limit(100);

  type Row = {
    id: string;
    label: string;
    sku: string;
    stock_qty: number;
    low_stock_threshold: number;
    products: { name: string } | null;
  };

  return ((data ?? []) as unknown as Row[])
    .filter((v) => v.stock_qty <= (v.low_stock_threshold ?? 5))
    .slice(0, limit)
    .map((v) => ({
      id: v.id,
      productName: v.products?.name ?? "Product",
      label: v.label,
      sku: v.sku,
      stockQty: v.stock_qty,
      threshold: v.low_stock_threshold,
    }));
}

export async function getAdminOrders(): Promise<AdminOrderListItem[]> {
  if (!isSupabaseConfigured()) {
    return mockOrders.map((o) => ({
      id: o.id,
      dbId: o.id,
      customer: o.customer,
      email: o.email,
      phone: o.phone,
      city: o.city,
      total: o.total,
      status: mockStatusToOrder(o.status),
      paymentStatus: o.status === "pending" ? "pending" : "paid",
      paymentMethod: "razorpay",
      placedAt: o.placedAt,
      itemCount: o.items.reduce((s, i) => s + i.qty, 0),
    }));
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("*, order_items(qty)")
    .order("created_at", { ascending: false })
    .limit(100);

  type Row = {
    id: string;
    order_number: string;
    customer_email: string | null;
    customer_phone: string | null;
    address_snapshot: { name?: string; city?: string };
    total_paise: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method: string;
    created_at: string;
    order_items: { qty: number }[] | null;
  };

  return ((data ?? []) as unknown as Row[]).map((o) => ({
    id: o.order_number,
    dbId: o.id,
    customer: o.address_snapshot?.name ?? "Customer",
    email: o.customer_email ?? "",
    phone: o.customer_phone ?? "",
    city: o.address_snapshot?.city ?? "",
    total: o.total_paise / 100,
    status: o.status,
    paymentStatus: o.payment_status,
    paymentMethod: o.payment_method,
    placedAt: o.created_at,
    itemCount: (o.order_items ?? []).reduce((s, i) => s + i.qty, 0),
  }));
}

export async function getAdminOrderById(idOrNumber: string) {
  if (!isSupabaseConfigured()) {
    const order = mockOrders.find(
      (o) => o.id === idOrNumber || o.id === decodeURIComponent(idOrNumber),
    );
    if (!order) return null;
    return {
      dbId: order.id,
      orderNumber: order.id,
      customer: order.customer,
      email: order.email,
      phone: order.phone,
      city: order.city,
      total: order.total,
      subtotal: order.total,
      shipping: 0,
      status: mockStatusToOrder(order.status),
      paymentStatus: order.status === "pending" ? "pending" : "paid",
      paymentMethod: "razorpay" as const,
      razorpayOrderId: null as string | null,
      razorpayPaymentId: null as string | null,
      notes: order.notes ?? null,
      placedAt: order.placedAt,
      address: {
        name: order.customer,
        phone: order.phone,
        line1: `${order.city} delivery address`,
        line2: order.notes ? "Landmark noted in order notes" : "",
        city: order.city,
        state: "—",
        pincode: "000000",
      },
      courierName: null as string | null,
      awbCode: null as string | null,
      shipmentId: null as string | null,
      trackingUrl: null as string | null,
      shippingStatus: null as string | null,
      items: order.items.map((i) => ({
        name: i.name,
        qty: i.qty,
        unitPrice: i.price,
        sku: null as string | null,
      })),
    };
  }

  type OrderDetailRow = {
    id: string;
    order_number: string;
    customer_email: string | null;
    customer_phone: string | null;
    address_snapshot: Record<string, string | undefined> | null;
    total_paise: number;
    subtotal_paise: number;
    shipping_paise: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method: string;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    notes: string | null;
    created_at: string;
    courier_name: string | null;
    awb_code: string | null;
    shipment_id: string | null;
    tracking_url: string | null;
    shipping_status: string | null;
    order_items: {
      name_snapshot: string;
      qty: number;
      unit_price_paise: number;
      sku_snapshot: string | null;
    }[] | null;
  };

  const admin = createAdminClient();
  const { data: byNumber } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", idOrNumber)
    .maybeSingle();

  let row = byNumber as OrderDetailRow | null;
  if (!row) {
    const { data: byId } = await admin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", idOrNumber)
      .maybeSingle();
    row = byId as OrderDetailRow | null;
  }
  if (!row) return null;

  const addr = (row.address_snapshot ?? {}) as {
    name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  return {
    dbId: row.id,
    orderNumber: row.order_number,
    customer: addr.name ?? "Customer",
    email: row.customer_email ?? "",
    phone: row.customer_phone ?? addr.phone ?? "",
    city: addr.city ?? "",
    total: row.total_paise / 100,
    subtotal: row.subtotal_paise / 100,
    shipping: row.shipping_paise / 100,
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    notes: row.notes,
    placedAt: row.created_at,
    address: {
      name: addr.name ?? "",
      phone: addr.phone ?? "",
      line1: addr.line1 ?? "",
      line2: addr.line2 ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      pincode: addr.pincode ?? "",
    },
    courierName: row.courier_name,
    awbCode: row.awb_code,
    shipmentId: row.shipment_id,
    trackingUrl: row.tracking_url,
    shippingStatus: row.shipping_status,
    items: (row.order_items ?? []).map((i) => ({
      name: i.name_snapshot,
      qty: i.qty,
      unitPrice: i.unit_price_paise / 100,
      sku: i.sku_snapshot,
    })),
  };
}

export async function getAdminProducts(): Promise<AdminProductListItem[]> {
  if (!isSupabaseConfigured()) {
    return catalogueProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: String(p.category),
      categoryId: null,
      price: p.price,
      image: p.image,
      variantCount: p.variants.length,
      stockQty: p.variants.reduce((s, v) => s + (v.stockQty ?? 12), 0),
      published: true,
      featured: Boolean(p.badge),
      rating: p.rating,
    }));
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select(
      "id, slug, name, published, featured, rating, categories(slug), product_variants(price_paise, stock_qty), product_images(storage_path, sort_order)",
    )
    .order("name");

  type Row = {
    id: string;
    slug: string;
    name: string;
    published: boolean;
    featured: boolean;
    rating: number | null;
    categories: { slug: string } | null;
    product_variants: { price_paise: number; stock_qty: number }[] | null;
    product_images: { storage_path: string; sort_order: number }[] | null;
  };

  return ((data ?? []) as unknown as Row[]).map((p) => {
    const variants = p.product_variants ?? [];
    const images = (p.product_images ?? []).sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    const minPrice = variants.length
      ? Math.min(...variants.map((v) => v.price_paise)) / 100
      : 0;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.categories?.slug ?? "uncategorized",
      categoryId: null,
      price: minPrice,
      image: images[0]?.storage_path ?? null,
      variantCount: variants.length,
      stockQty: variants.reduce((s, v) => s + v.stock_qty, 0),
      published: p.published,
      featured: p.featured,
      rating: Number(p.rating ?? 0),
    };
  });
}

export async function getAdminProductById(
  id: string,
): Promise<AdminProductDetail | null> {
  if (!isSupabaseConfigured()) {
    const p = catalogueProducts.find((x) => x.id === id || x.slug === id);
    if (!p) return null;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      longDescription: p.longDescription ?? null,
      categoryId: null,
      categorySlug: String(p.category),
      subcategoryId: null,
      sourceName: null,
      spiceNote: p.spiceNote ?? null,
      dietary: p.dietary ?? [],
      badge: p.badge ?? null,
      tagline: p.tagline ?? null,
      seoTitle: null,
      seoDescription: null,
      featured: Boolean(p.badge),
      bestseller: false,
      newArrival: false,
      seasonal: false,
      origin: p.origin ?? null,
      shelfLife: p.shelfLife ?? null,
      ingredients: p.ingredients ?? [],
      published: true,
      variants: p.variants.map((v, i) => ({
        id: v.id,
        label: v.label,
        sku: v.sku ?? `${p.slug}-${i}`,
        pricePaise: Math.round((v.price ?? p.price) * 100),
        mrpPaise: p.originalPrice
          ? Math.round(p.originalPrice * 100)
          : null,
        weightG: null,
        sellingUnit: "other",
        quantityValue: null,
        stockQty: v.stockQty ?? 12,
        lowStockThreshold: 5,
        available: true,
        sortOrder: i,
      })),
      images: [
        {
          id: "img-0",
          storagePath: p.image,
          alt: p.imageAlt,
          sortOrder: 0,
        },
      ],
    };
  }

  type Variant = {
    id: string;
    label: string;
    sku: string;
    price_paise: number;
    mrp_paise: number | null;
    weight_g: number | null;
    selling_unit: string;
    quantity_value: number | null;
    stock_qty: number;
    low_stock_threshold: number;
    available: boolean;
    sort_order: number;
  };
  type Image = {
    id: string;
    storage_path: string;
    alt: string | null;
    sort_order: number;
  };
  type ProductDetailRow = {
    id: string;
    slug: string;
    name: string;
    description: string;
    long_description: string | null;
    category_id: string | null;
    subcategory_id: string | null;
    source_name: string | null;
    seasonal: boolean;
    spice_note: string | null;
    dietary: string[] | null;
    badge: string | null;
    tagline: string | null;
    seo_title: string | null;
    seo_description: string | null;
    featured: boolean;
    bestseller: boolean;
    new_arrival: boolean;
    origin: string | null;
    shelf_life: string | null;
    ingredients: string[] | null;
    published: boolean;
    categories: { slug: string } | null;
    product_variants: Variant[] | null;
    product_images: Image[] | null;
  };

  const admin = createAdminClient();
  const { data: raw } = await admin
    .from("products")
    .select(
      "*, categories(slug), product_variants(*), product_images(*)",
    )
    .or(`id.eq.${id},slug.eq.${id}`)
    .maybeSingle();

  const data = raw as ProductDetailRow | null;
  if (!data) return null;

  const variants = (data.product_variants ?? []).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const images = (data.product_images ?? []).sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    longDescription: data.long_description,
    categoryId: data.category_id,
    categorySlug: data.categories?.slug ?? "",
    subcategoryId: data.subcategory_id,
    sourceName: data.source_name,
    spiceNote: data.spice_note,
    dietary: data.dietary ?? [],
    badge: data.badge,
    tagline: data.tagline,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    featured: data.featured,
    bestseller: data.bestseller,
    newArrival: data.new_arrival,
    seasonal: data.seasonal ?? false,
    origin: data.origin,
    shelfLife: data.shelf_life,
    ingredients: data.ingredients ?? [],
    published: data.published,
    variants: variants.map((v) => ({
      id: v.id,
      label: v.label,
      sku: v.sku,
      pricePaise: v.price_paise,
      mrpPaise: v.mrp_paise,
      weightG: v.weight_g,
      sellingUnit: v.selling_unit ?? "other",
      quantityValue: v.quantity_value != null ? Number(v.quantity_value) : null,
      stockQty: v.stock_qty,
      lowStockThreshold: v.low_stock_threshold,
      available: v.available ?? true,
      sortOrder: v.sort_order,
    })),
    images: images.map((img) => ({
      id: img.id,
      storagePath: img.storage_path,
      alt: img.alt,
      sortOrder: img.sort_order,
    })),
  };
}

export async function getAdminCategories() {
  if (!isSupabaseConfigured()) {
    return homeCategories.map((c, i) => ({
      id: c.id,
      slug: c.id,
      title: c.title,
      subtitle: c.subtitle,
      imageUrl: c.image,
      sortOrder: i,
      published: true,
      featured: false,
      productCount: catalogueProducts.filter(
        (p) => p.category === c.id || String(p.category) === c.id,
      ).length,
    }));
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("categories")
    .select("*, products(id)")
    .order("sort_order");

  type Row = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    image_url: string | null;
    sort_order: number;
    published: boolean;
    featured: boolean;
    products: { id: string }[] | null;
  };

  return ((data ?? []) as unknown as Row[]).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    imageUrl: c.image_url,
    sortOrder: c.sort_order,
    published: c.published,
    featured: c.featured,
    productCount: (c.products ?? []).length,
  }));
}

export async function getAdminSubcategories(categoryId?: string) {
  if (!isSupabaseConfigured()) return [] as AdminSubcategoryRow[];

  const admin = createAdminClient();
  let query = admin
    .from("subcategories")
    .select("*, categories(title), products(id)")
    .order("sort_order");

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data } = await query;

  type Row = {
    id: string;
    category_id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    image_url: string | null;
    sort_order: number;
    published: boolean;
    categories: { title: string } | null;
    products: { id: string }[] | null;
  };

  return ((data ?? []) as unknown as Row[]).map((s) => ({
    id: s.id,
    categoryId: s.category_id,
    categoryTitle: s.categories?.title ?? "",
    slug: s.slug,
    title: s.title,
    subtitle: s.subtitle,
    imageUrl: s.image_url,
    sortOrder: s.sort_order,
    published: s.published,
    productCount: (s.products ?? []).length,
  }));
}

export async function getCategoryAttributeRules(
  categoryId: string,
  subcategoryId?: string | null,
) {
  if (!isSupabaseConfigured()) return [];

  const admin = createAdminClient();
  let query = admin
    .from("category_attribute_rules")
    .select("*, attribute_definitions(*)")
    .eq("category_id", categoryId)
    .order("sort_order");

  if (subcategoryId) {
    query = query.or(`subcategory_id.is.null,subcategory_id.eq.${subcategoryId}`);
  } else {
    query = query.is("subcategory_id", null);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getAdminInventory() {
  if (!isSupabaseConfigured()) {
    // Catalogue variant ids (e.g. "400g", "6") are reused across products —
    // use a composite id so React keys stay unique.
    return catalogueProducts.flatMap((p) =>
      p.variants.map((v) => ({
        id: `${p.id}__${v.id}`,
        productId: p.id,
        productName: p.name,
        label: v.label,
        sku: v.sku ?? `${p.slug}-${v.id}`,
        stockQty: v.stockQty ?? 12,
        threshold: 5,
        available: true,
        price: v.price ?? p.price,
      })),
    );
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("product_variants")
    .select(
      "id, label, sku, stock_qty, low_stock_threshold, available, price_paise, product_id, products(name)",
    )
    .order("sku");

  type Row = {
    id: string;
    product_id: string;
    label: string;
    sku: string;
    stock_qty: number;
    low_stock_threshold: number;
    available: boolean;
    price_paise: number;
    products: { name: string } | null;
  };

  return ((data ?? []) as unknown as Row[]).map((v) => ({
    id: v.id,
    productId: v.product_id,
    productName: v.products?.name ?? "Product",
    label: v.label,
    sku: v.sku,
    stockQty: v.stock_qty,
    threshold: v.low_stock_threshold,
    available: v.available ?? true,
    price: v.price_paise / 100,
  }));
}

function mapOrderListItem(o: {
  id: string;
  order_number: string;
  customer_email: string | null;
  customer_phone: string | null;
  address_snapshot: { name?: string; city?: string } | null;
  total_paise: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  created_at: string;
  order_items: { qty: number }[] | null;
}): AdminOrderListItem {
  return {
    id: o.order_number,
    dbId: o.id,
    customer: o.address_snapshot?.name ?? "Customer",
    email: o.customer_email ?? "",
    phone: o.customer_phone ?? "",
    city: o.address_snapshot?.city ?? "",
    total: o.total_paise / 100,
    status: o.status,
    paymentStatus: o.payment_status,
    paymentMethod: o.payment_method,
    placedAt: o.created_at,
    itemCount: (o.order_items ?? []).reduce((s, i) => s + i.qty, 0),
  };
}

async function customerOrderStats() {
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("user_id, total_paise, customer_email");

  const counts = new Map<string, { count: number; spent: number }>();
  for (const o of orders ?? []) {
    const key = o.user_id ?? o.customer_email ?? "";
    if (!key) continue;
    const cur = counts.get(key) ?? { count: 0, spent: 0 };
    cur.count += 1;
    cur.spent += o.total_paise / 100;
    counts.set(key, cur);
  }
  return counts;
}

function toAdminCustomer(
  p: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    created_at: string;
  },
  counts: Map<string, { count: number; spent: number }>,
): AdminCustomer {
  const stats = counts.get(p.id) ?? counts.get(p.email ?? "") ?? { count: 0, spent: 0 };
  return {
    id: p.id,
    name: p.full_name ?? "—",
    email: p.email ?? "",
    phone: p.phone ?? "",
    role: p.role,
    orderCount: stats.count,
    spent: stats.spent,
    createdAt: p.created_at,
  };
}

function mockCustomers(): AdminCustomer[] {
  const map = new Map<
    string,
    { name: string; email: string; phone: string; orderCount: number; spent: number }
  >();
  for (const o of mockOrders) {
    const cur = map.get(o.email) ?? {
      name: o.customer,
      email: o.email,
      phone: o.phone,
      orderCount: 0,
      spent: 0,
    };
    cur.orderCount += 1;
    cur.spent += o.total;
    map.set(o.email, cur);
  }
  return Array.from(map.entries()).map(([email, c], i) => ({
    id: `mock-${i}`,
    ...c,
    email,
    role: "customer",
    createdAt: mockOrders.find((o) => o.email === email)?.placedAt ?? "",
  }));
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  if (!isSupabaseConfigured()) {
    return mockCustomers().filter((c) => c.role !== "admin");
  }

  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .neq("role", "admin")
    .order("created_at", { ascending: false })
    .limit(200);

  const counts = await customerOrderStats();
  return (profiles ?? [])
    .filter((p) => p.role !== "admin")
    .map((p) => toAdminCustomer(p, counts));
}

export async function getAdminCustomerById(id: string): Promise<AdminCustomer | null> {
  if (!isSupabaseConfigured()) {
    const customer = mockCustomers().find((c) => c.id === id) ?? null;
    if (!customer || customer.role === "admin") return null;
    return customer;
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!profile || profile.role === "admin") return null;

  const counts = await customerOrderStats();
  return toAdminCustomer(profile, counts);
}

export async function getAdminCustomerOrders(
  userId: string,
  email: string,
): Promise<AdminOrderListItem[]> {
  if (!isSupabaseConfigured()) {
    const customer = mockCustomers().find((c) => c.id === userId);
    const matchEmail = (customer?.email || email).toLowerCase();
    return (await getAdminOrders()).filter(
      (o) => o.email.toLowerCase() === matchEmail,
    );
  }

  const admin = createAdminClient();
  const select =
    "id, order_number, customer_email, customer_phone, address_snapshot, total_paise, status, payment_status, payment_method, created_at, order_items(qty)";

  const { data: byUser } = await admin
    .from("orders")
    .select(select)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const { data: byEmail } = email
    ? await admin
        .from("orders")
        .select(select)
        .eq("customer_email", email)
        .order("created_at", { ascending: false })
    : { data: [] as never[] };

  type Row = Parameters<typeof mapOrderListItem>[0];
  const merged = new Map<string, AdminOrderListItem>();
  for (const row of [...(byUser ?? []), ...(byEmail ?? [])] as unknown as Row[]) {
    merged.set(row.id, mapOrderListItem(row));
  }
  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
  );
}

export async function getAdminEnquiries() {
  if (!isSupabaseConfigured()) {
    return mockEnquiries.map((e) => ({
      id: e.id,
      type: "corporate" as const,
      status: e.status as EnquiryStatus,
      createdAt: e.receivedAt,
      name: e.name,
      company: e.company,
      email: e.email,
      quantity: e.quantity,
      notes: e.notes,
      payload: {
        name: e.name,
        company: e.company,
        email: e.email,
        quantity: e.quantity,
        notes: e.notes,
      },
    }));
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (data ?? []).map((e) => {
    const payload = (e.payload ?? {}) as Record<string, unknown>;
    return {
      id: e.id,
      type: e.type,
      status: e.status,
      createdAt: e.created_at,
      name: String(payload.name ?? payload.full_name ?? "—"),
      company: String(payload.company ?? ""),
      email: String(payload.email ?? ""),
      quantity: Number(payload.quantity ?? payload.qty ?? 0),
      notes: String(payload.message ?? payload.notes ?? ""),
      payload,
    };
  });
}

export async function getAdminOutlets() {
  if (!isSupabaseConfigured()) {
    return flagshipOutlets.map((o, i) => ({
      id: o.id,
      name: o.name,
      address: o.address,
      phone: o.phone,
      hours: o.hours,
      city: o.city,
      type: o.type,
      lat: null as number | null,
      lng: null as number | null,
      sortOrder: i,
      published: true,
    }));
  }

  const admin = createAdminClient();
  const { data } = await admin.from("outlets").select("*").order("sort_order");
  return (data ?? []).map((o) => ({
    id: o.id,
    name: o.name,
    address: o.address,
    phone: o.phone,
    hours: o.hours,
    city: "",
    type: "store",
    lat: o.lat,
    lng: o.lng,
    sortOrder: o.sort_order,
    published: o.published,
  }));
}

export async function getAdminCombos() {
  if (!isSupabaseConfigured()) {
    const pool = catalogueProducts.filter((p) =>
      (comboBuilderPoolIds as readonly string[]).includes(p.id),
    );
    return {
      source: "static" as const,
      boxes: comboBoxSizes.map((b) => ({
        id: b.id,
        slug: b.id,
        name: b.name,
        description: b.description,
        price: b.basePrice,
        mrp: null as number | null,
        sku: "" as string,
        sortOrder: 0,
        slots: b.slots,
        published: true,
        featured: false,
        imageUrl: null as string | null,
        itemCount: b.slots,
      })),
      pool: pool.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
      })),
    };
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("combos")
    .select("*, combo_items(id)")
    .order("sort_order");

  type Row = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    price_paise: number;
    mrp_paise: number | null;
    sku: string | null;
    sort_order: number;
    published: boolean;
    featured: boolean;
    image_url: string | null;
    combo_items: { id: string }[] | null;
  };

  return {
    source: "supabase" as const,
    boxes: ((data ?? []) as unknown as Row[]).map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description ?? "",
      price: c.price_paise / 100,
      mrp: c.mrp_paise != null ? c.mrp_paise / 100 : null,
      sku: c.sku ?? "",
      sortOrder: c.sort_order,
      slots: (c.combo_items ?? []).length,
      published: c.published,
      featured: c.featured,
      imageUrl: c.image_url,
      itemCount: (c.combo_items ?? []).length,
    })),
    pool: [] as { id: string; name: string; price: number }[],
  };
}

export async function getAdminMedia() {
  if (!isSupabaseConfigured()) {
    return mockMediaAssets.map((a) => ({
      id: a.id,
      storagePath: a.path,
      alt: a.name,
      folder: a.kind,
      createdAt: "",
      publicUrl: a.path,
    }));
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return (data ?? []).map((a) => ({
    id: a.id,
    storagePath: a.storage_path,
    alt: a.alt,
    folder: a.folder,
    createdAt: a.created_at,
    publicUrl: a.storage_path.startsWith("http")
      ? a.storage_path
      : a.storage_path.startsWith("/")
        ? a.storage_path
        : `${base}/storage/v1/object/public/media/${a.storage_path}`,
  }));
}

export async function getContentBlock(pageKey: string, sectionKey: string) {
  if (!isSupabaseConfigured()) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("content_blocks")
    .select("*")
    .eq("page_key", pageKey)
    .eq("section_key", sectionKey)
    .maybeSingle();
  return data;
}

export async function getHeroCarouselContent(
  pageKey: CarouselPageKey = "home",
) {
  const block = await getContentBlock(pageKey, "hero_slides");
  if (block?.content && Array.isArray(block.content) && block.content.length) {
    return block.content as { id: string; src: string; alt: string }[];
  }
  return staticCarouselFallback(pageKey);
}

export function getIntegrationStatus() {
  return {
    supabase: isSupabaseConfigured(),
    razorpay: Boolean(
      process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
    ),
    shiprocket: Boolean(
      process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD,
    ),
    resend: Boolean(process.env.RESEND_API_KEY),
    storage: isSupabaseConfigured(),
  };
}
