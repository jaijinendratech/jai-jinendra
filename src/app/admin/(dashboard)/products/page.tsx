import type { Metadata } from "next";
import { getAdminCategories, getAdminProducts, getIntegrationStatus } from "@/lib/admin/queries";
import { AdminPageHeader, NoticeBanner } from "@/components/admin/ui";
import { ProductsTable } from "./ProductsTable";

export const metadata: Metadata = {
  title: "Admin · Products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const products = await getAdminProducts();
  const categories = await getAdminCategories();
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
      />
      <NoticeBanner notice={notice} />
      <ProductsTable
        products={products}
        categories={categories.map((c) => ({ id: c.id, title: c.title }))}
        supabaseOn={supabase}
      />
    </div>
  );
}
