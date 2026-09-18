import type { Metadata } from "next";
import {
  getAdminCategories,
  getIntegrationStatus,
} from "@/lib/admin/queries";
import { AdminPageHeader, NoticeBanner } from "@/components/admin/ui";
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
  const { supabase } = getIntegrationStatus();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description={
          supabase
            ? "CRUD against Supabase categories."
            : "Catalogue tiles (static) — connect Supabase to create/edit."
        }
      />
      <NoticeBanner notice={notice} error={error} />
      <CategoriesManager
        categories={categories.map((c) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          subtitle: c.subtitle ?? null,
          imageUrl: c.imageUrl ?? null,
          sortOrder: c.sortOrder,
          published: c.published,
          featured: c.featured,
          productCount: c.productCount,
        }))}
        supabase={supabase}
      />
    </div>
  );
}
