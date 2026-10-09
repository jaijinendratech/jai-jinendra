import { siteConfig } from "@/data/home";
import type { InvoiceSeller } from "@/lib/invoice/generate";

/** Seller block printed on every customer invoice. Fill `gstin` once registered; it prints only when set. */
export const invoiceSeller: InvoiceSeller = {
  name: siteConfig.legalName,
  addressLines: ["Aerodrome Circle, Kota", "Rajasthan, India"],
  phone: siteConfig.phone,
  email: siteConfig.email,
  fssai: siteConfig.fssai,
  gstin: "",
};
