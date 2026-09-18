import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getAdminCategories,
  getAdminProductById,
  getIntegrationStatus,
} from "@/lib/admin/queries";
import { NoticeBanner } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = {
  title: "Admin · Edit product",
  robots: { index: false, follow: false },
};

export default async function AdminProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params;
  const { notice } = await searchParams;

  // Create is modal-based on the products list; keep this route for edit deep-links / duplicate.
  if (id === "new") {
    redirect("/admin/products");
  }

  const product = await getAdminProductById(id);
  if (!product) notFound();

  const categories = await getAdminCategories();
  const { supabase } = getIntegrationStatus();

  return (
    <div className="space-y-4">
      <NoticeBanner notice={notice} />
      <ProductForm
        product={product}
        categories={categories.map((c) => ({ id: c.id, title: c.title }))}
        supabase={supabase}
      />
    </div>
  );
}
