import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCustomerSessionUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { invoiceSeller } from "@/data/invoice";
import { generateInvoicePdf, type InvoiceData } from "@/lib/invoice/generate";

type OrderRow = {
  order_number: string;
  created_at: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal_paise: number;
  discount_paise: number;
  prepaid_discount_paise: number;
  shipping_paise: number;
  total_paise: number;
  coupon_code: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  address_snapshot: Record<string, string | undefined> | null;
  order_items: {
    name_snapshot: string;
    sku_snapshot: string | null;
    qty: number;
    unit_price_paise: number;
  }[];
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on delivery",
  razorpay: "Online (Razorpay)",
};

/** Invoice PDF for one of the signed-in customer's own orders. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Invoices are unavailable." }, { status: 503 });
  }

  const user = await getCustomerSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "order_number, created_at, status, payment_method, payment_status, subtotal_paise, discount_paise, prepaid_discount_paise, shipping_paise, total_paise, coupon_code, customer_email, customer_phone, address_snapshot, order_items(name_snapshot, sku_snapshot, qty, unit_price_paise)",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const order = data as OrderRow | null;
  // Unpaid online attempts are not orders, so they get no invoice either.
  if (!order || order.status === "pending_payment" || order.status === "cancelled") {
    return NextResponse.json({ error: "Invoice not available." }, { status: 404 });
  }

  const addr = order.address_snapshot ?? {};
  const invoice: InvoiceData = {
    invoiceNumber: `INV-${order.order_number}`,
    orderNumber: order.order_number,
    orderDate: new Date(order.created_at).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }),
    paymentMethod: PAYMENT_LABELS[order.payment_method] ?? order.payment_method,
    paymentStatus:
      order.payment_status === "paid"
        ? "Paid"
        : order.payment_method === "cod"
          ? "Pay on delivery"
          : order.payment_status.charAt(0).toUpperCase() +
            order.payment_status.slice(1),
    customer: {
      name: addr.name ?? "Customer",
      phone: order.customer_phone ?? addr.phone ?? "",
      email: order.customer_email ?? addr.email ?? "",
      addressLines: [
        [addr.line1, addr.line2].filter(Boolean).join(", "),
        [addr.city, addr.state].filter(Boolean).join(", ") +
          (addr.pincode ? ` - ${addr.pincode}` : ""),
      ].filter((line) => line.trim()),
    },
    items: order.order_items.map((item) => ({
      name: item.name_snapshot,
      sku: item.sku_snapshot,
      qty: item.qty,
      unitPaise: item.unit_price_paise,
    })),
    subtotalPaise: order.subtotal_paise,
    couponCode: order.coupon_code,
    discountPaise: order.discount_paise ?? 0,
    prepaidDiscountPaise: order.prepaid_discount_paise ?? 0,
    shippingPaise: order.shipping_paise,
    totalPaise: order.total_paise,
    seller: invoiceSeller,
  };

  let logo: Uint8Array | null = null;
  try {
    logo = await readFile(
      path.join(process.cwd(), "public", "brand", "logo-namkeens.png"),
    );
  } catch {
    // Invoice still renders, just without the logo.
  }

  const pdf = await generateInvoicePdf(invoice, logo);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Invoice-${order.order_number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
