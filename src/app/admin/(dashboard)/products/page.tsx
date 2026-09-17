import type { Metadata } from "next";
import { getAdminProducts, getIntegrationStatus } from "@/lib/admin/queries";
import { AdminPageHeader } from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
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
          <AdminIconButton
            as="link"
            href="/admin/products/new"
            label="Add product"
            icon="plus"
            variant="primary"
          />
        }
      />
      <ProductsTable products={products} supabaseOn={supabase} />
    </div>
  );
}
