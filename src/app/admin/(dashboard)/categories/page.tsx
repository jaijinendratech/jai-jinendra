import type { Metadata } from "next";
import {
  getAdminCategories,
  getAdminSubcategories,
  getIntegrationStatus,
} from "@/lib/admin/queries";
import { AdminPageHeader, NoticeBanner } from "@/components/admin/ui";
import { SubcategoriesManager } from "@/components/admin/SubcategoriesManager";
import { CategoriesManager } from "./CategoriesManager";

export const metadata: Metadata = {
  title: "Admin · Categories",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { notice, error } = await searchParams;
  const categories = await getAdminCategories();
  const subcategories = await getAdminSubcategories();
  const { supabase } = getIntegrationStatus();

  const categoryRows = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle ?? null,
    imageUrl: c.imageUrl ?? null,
    sortOrder: c.sortOrder,
    published: c.published,
    featured: c.featured,
    productCount: c.productCount,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Organize the aisle shoppers browse by."
      />
      <NoticeBanner notice={notice} error={error} />
      <CategoriesManager categories={categoryRows} supabase={supabase} />
      <SubcategoriesManager
        categories={categoryRows}
        subcategories={subcategories}
        supabase={supabase}
      />
    </div>
  );
}
