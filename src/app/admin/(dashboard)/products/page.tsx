import type { Metadata } from "next";
import { getAdminCategories, getAdminProducts, getAdminSubcategories, getIntegrationStatus } from "@/lib/admin/queries";
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
  const subcategories = await getAdminSubcategories();
  const { supabase } = getIntegrationStatus();

  const categoryOptions = categories.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description={`${products.length} treats ready for the shop floor.`}
      />
      <NoticeBanner notice={notice} />
      <ProductsTable
        products={products}
        categories={categoryOptions}
        subcategories={subcategories}
        supabaseOn={supabase}
      />
    </div>
  );
}
