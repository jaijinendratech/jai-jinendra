import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export type InvoiceSeller = {
  name: string;
  addressLines: string[];
  phone: string;
  email: string;
  fssai?: string;
  /** Printed only when set. */
  gstin?: string;
};

export type InvoiceData = {
  invoiceNumber: string;
  orderNumber: string;
  orderDate: string;
  paymentMethod: string;
  paymentStatus: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    addressLines: string[];
  };
  items: { name: string; sku: string | null; qty: number; unitPaise: number }[];
  subtotalPaise: number;
  couponCode: string | null;
  discountPaise: number;
  prepaidDiscountPaise: number;
  shippingPaise: number;
  totalPaise: number;
  seller: InvoiceSeller;
};

const BRAND = rgb(0.71, 0.04, 0.125); // #B50A20
const INK = rgb(0.12, 0.11, 0.1);
const MUTED = rgb(0.43, 0.4, 0.39);
const LINE = rgb(0.88, 0.85, 0.83);
const SHADE = rgb(0.98, 0.95, 0.93);

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 40;

/** Standard PDF fonts only cover WinAnsi: replace anything else so drawing never throws. */
function safe(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/₹/g, "Rs.")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
}

export function formatRs(paise: number): string {
  const rupees = paise / 100;
  const fixed = rupees.toFixed(2);
  const [whole, frac] = fixed.split(".");
  // Indian digit grouping: 12,34,567
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${last3}` : last3;
  return `Rs. ${grouped}.${frac}`;
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = safe(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function drawRight(
  page: PDFPage,
  text: string,
  rightX: number,
  y: number,
  font: PDFFont,
  size: number,
  color = INK,
) {
  const t = safe(text);
  page.drawText(t, { x: rightX - font.widthOfTextAtSize(t, size), y, size, font, color });
}

export async function generateInvoicePdf(
  data: InvoiceData,
  logoPng: Uint8Array | null,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Invoice ${data.invoiceNumber}`);
  pdf.setAuthor(data.seller.name);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = logoPng ? await pdf.embedPng(logoPng) : null;

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  // ---- Header: logo + seller (left), invoice meta (right) ----
  let leftY = y;
  if (logo) {
    const logoW = 150;
    const logoH = (logo.height / logo.width) * logoW;
    page.drawImage(logo, { x: MARGIN, y: y - logoH, width: logoW, height: logoH });
    leftY = y - logoH - 8;
  }
  page.drawText(safe(data.seller.name), { x: MARGIN, y: leftY - 10, size: 11, font: bold, color: INK });
  leftY -= 24;
  const sellerLines = [
    ...data.seller.addressLines,
    `Phone: ${data.seller.phone}`,
    `Email: ${data.seller.email}`,
    ...(data.seller.fssai ? [`FSSAI Lic. No.: ${data.seller.fssai}`] : []),
    ...(data.seller.gstin ? [`GSTIN: ${data.seller.gstin}`] : []),
  ];
  for (const line of sellerLines) {
    page.drawText(safe(line), { x: MARGIN, y: leftY, size: 9, font: regular, color: MUTED });
    leftY -= 12;
  }

  const rightX = PAGE_W - MARGIN;
  drawRight(page, "INVOICE", rightX, y - 22, bold, 26, BRAND);
  const meta: [string, string][] = [
    ["Invoice no.", data.invoiceNumber],
    ["Invoice date", data.orderDate],
    ["Order no.", data.orderNumber],
    ["Payment", data.paymentMethod],
    ["Payment status", data.paymentStatus],
  ];
  let metaY = y - 48;
  for (const [label, value] of meta) {
    drawRight(page, value, rightX, metaY, bold, 9.5);
    drawRight(
      page,
      `${label}:`,
      rightX - bold.widthOfTextAtSize(safe(value), 9.5) - 6,
      metaY,
      regular,
      9.5,
      MUTED,
    );
    metaY -= 14;
  }

  y = Math.min(leftY, metaY) - 14;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1, color: BRAND });
  y -= 22;

  // ---- Bill to / Ship to ----
  const colW = (PAGE_W - MARGIN * 2 - 20) / 2;
  const block = (title: string, x: number) => {
    page.drawText(title, { x, y, size: 9, font: bold, color: BRAND });
    let by = y - 14;
    page.drawText(safe(data.customer.name), { x, y: by, size: 10.5, font: bold, color: INK });
    by -= 13;
    for (const raw of data.customer.addressLines) {
      for (const line of wrap(raw, regular, 9.5, colW)) {
        page.drawText(line, { x, y: by, size: 9.5, font: regular, color: INK });
        by -= 12;
      }
    }
    if (data.customer.phone) {
      page.drawText(safe(`Phone: ${data.customer.phone}`), { x, y: by, size: 9.5, font: regular, color: MUTED });
      by -= 12;
    }
    if (data.customer.email) {
      page.drawText(safe(`Email: ${data.customer.email}`), { x, y: by, size: 9.5, font: regular, color: MUTED });
      by -= 12;
    }
    return by;
  };
  const afterBill = block("BILL TO", MARGIN);
  const afterShip = block("SHIP TO", MARGIN + colW + 20);
  y = Math.min(afterBill, afterShip) - 16;

  // ---- Items table ----
  const cols = {
    no: MARGIN + 6,
    item: MARGIN + 30,
    qtyRight: PAGE_W - MARGIN - 190,
    rateRight: PAGE_W - MARGIN - 100,
    amountRight: PAGE_W - MARGIN - 6,
  };
  const itemMaxW = cols.qtyRight - cols.item - 40;

  const drawTableHeader = () => {
    page.drawRectangle({ x: MARGIN, y: y - 6, width: PAGE_W - MARGIN * 2, height: 22, color: SHADE });
    page.drawText("#", { x: cols.no, y: y, size: 9, font: bold, color: INK });
    page.drawText("ITEM", { x: cols.item, y, size: 9, font: bold, color: INK });
    drawRight(page, "QTY", cols.qtyRight, y, bold, 9);
    drawRight(page, "RATE", cols.rateRight, y, bold, 9);
    drawRight(page, "AMOUNT", cols.amountRight, y, bold, 9);
    y -= 24;
  };
  drawTableHeader();

  data.items.forEach((item, index) => {
    const nameLines = wrap(item.name, regular, 9.5, itemMaxW);
    const rowH = nameLines.length * 12 + (item.sku ? 11 : 0) + 8;
    if (y - rowH < MARGIN + 150) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN - 10;
      drawTableHeader();
    }
    page.drawText(String(index + 1), { x: cols.no, y, size: 9.5, font: regular, color: MUTED });
    let ty = y;
    for (const line of nameLines) {
      page.drawText(line, { x: cols.item, y: ty, size: 9.5, font: regular, color: INK });
      ty -= 12;
    }
    if (item.sku) {
      page.drawText(safe(`SKU: ${item.sku}`), { x: cols.item, y: ty, size: 8, font: regular, color: MUTED });
    }
    drawRight(page, String(item.qty), cols.qtyRight, y, regular, 9.5);
    drawRight(page, formatRs(item.unitPaise), cols.rateRight, y, regular, 9.5);
    drawRight(page, formatRs(item.unitPaise * item.qty), cols.amountRight, y, regular, 9.5);
    y -= rowH;
    page.drawLine({ start: { x: MARGIN, y: y + 4 }, end: { x: PAGE_W - MARGIN, y: y + 4 }, thickness: 0.5, color: LINE });
  });

  // ---- Totals ----
  if (y < MARGIN + 150) {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN - 10;
  }
  y -= 8;
  const labelRight = PAGE_W - MARGIN - 110;
  const valueRight = PAGE_W - MARGIN - 6;
  const totalsRow = (label: string, value: string, strong = false, color = INK) => {
    drawRight(page, label, labelRight, y, strong ? bold : regular, strong ? 11 : 9.5, strong ? INK : MUTED);
    drawRight(page, value, valueRight, y, strong ? bold : regular, strong ? 11 : 9.5, color);
    y -= strong ? 18 : 15;
  };
  totalsRow("Subtotal", formatRs(data.subtotalPaise));
  if (data.discountPaise > 0) {
    totalsRow(
      `Discount${data.couponCode ? ` (${data.couponCode})` : ""}`,
      `- ${formatRs(data.discountPaise)}`,
    );
  }
  if (data.prepaidDiscountPaise > 0) {
    totalsRow("Prepaid discount", `- ${formatRs(data.prepaidDiscountPaise)}`);
  }
  totalsRow("Shipping", data.shippingPaise === 0 ? "FREE" : formatRs(data.shippingPaise));
  page.drawLine({
    start: { x: labelRight - 90, y: y + 8 },
    end: { x: PAGE_W - MARGIN, y: y + 8 },
    thickness: 1,
    color: BRAND,
  });
  y -= 4;
  totalsRow("Total", formatRs(data.totalPaise), true, BRAND);
  y -= 6;
  page.drawText("All amounts in Indian Rupees (INR). Prices include applicable taxes.", {
    x: MARGIN,
    y,
    size: 8.5,
    font: regular,
    color: MUTED,
  });

  // ---- Footer on every page ----
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawLine({
      start: { x: MARGIN, y: MARGIN + 34 },
      end: { x: PAGE_W - MARGIN, y: MARGIN + 34 },
      thickness: 0.5,
      color: LINE,
    });
    const thanks = "Thank you for shopping with Jai Jinendra!";
    p.drawText(thanks, {
      x: (PAGE_W - bold.widthOfTextAtSize(thanks, 10)) / 2,
      y: MARGIN + 18,
      size: 10,
      font: bold,
      color: BRAND,
    });
    const note = `This is a computer-generated invoice and does not require a signature.   Page ${i + 1} of ${pages.length}`;
    p.drawText(note, {
      x: (PAGE_W - regular.widthOfTextAtSize(note, 8)) / 2,
      y: MARGIN + 6,
      size: 8,
      font: regular,
      color: MUTED,
    });
  });

  return pdf.save();
}
