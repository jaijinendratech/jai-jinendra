import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  const isNew = id === "new";
  const product = isNew ? null : await getAdminProductById(id);
  if (!isNew && !product) notFound();

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
