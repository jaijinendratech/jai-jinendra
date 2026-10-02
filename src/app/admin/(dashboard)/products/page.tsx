import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { productDetailSchemaReady } from "@/lib/db/product-detail-schema";
import {
  getAdminAttributeDefinitions,
  getAdminCategories,
  getAdminProducts,
  getAdminSubcategories,
  getIntegrationStatus,
} from "@/lib/admin/queries";
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
  const [products, categories, subcategories, attributeDefinitions] =
    await Promise.all([
      getAdminProducts(),
      getAdminCategories(),
      getAdminSubcategories(),
      getAdminAttributeDefinitions(),
    ]);
  const { supabase } = getIntegrationStatus();
  const detailSchemaReady = supabase
    ? await productDetailSchemaReady(createAdminClient())
    : true;

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
      {supabase && !detailSchemaReady ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Product editing works. Shipping, highlights, tags, and catalogue filter
          flags save after you apply{" "}
          <span className="font-semibold">
            supabase/migrations/010_product_detail_and_filters.sql
          </span>
          .
        </p>
      ) : null}
      <ProductsTable
        products={products}
        categories={categoryOptions}
        subcategories={subcategories}
        attributeDefinitions={attributeDefinitions}
        supabaseOn={supabase}
      />
    </div>
  );
}
