import type { Metadata } from "next";
import Link from "next/link";
import { getAdminProducts, getIntegrationStatus } from "@/lib/admin/queries";
import { AdminPageHeader, primaryBtnClassName } from "@/components/admin/ui";
import { ProductsTable } from "./ProductsTable";

export const metadata: Metadata = {
  title: "Admin · Products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  const { supabase } = getIntegrationStatus();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description={
          supabase
            ? `${products.length} products from Supabase.`
            : `${products.length} catalogue items (mock — connect Supabase to persist).`
        }
        actions={
          <Link href="/admin/products/new" className={primaryBtnClassName()}>
            Add product
          </Link>
        }
      />
      <ProductsTable products={products} supabaseOn={supabase} />
    </div>
  );
}
