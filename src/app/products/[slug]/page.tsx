import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import {
  getProductBySlug,
  getPublishedProducts,
  getRelatedProducts,
} from "@/lib/catalog/queries";
import { categoryHref, normalizeCategoryRef } from "@/lib/catalog/aliases";
import { categories, siteConfig } from "@/data/home";
import { isSupabaseConfigured } from "@/lib/env";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data } = await admin
      .from("products")
      .select("slug")
      .eq("published", true);
    return (data ?? []).map((product) => ({ slug: product.slug }));
  }
  const { catalogueProducts } = await import("@/data/catalogue");
  return catalogueProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };

  const title = product.seoTitle ?? product.name;
  const description = product.seoDescription ?? product.description;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/products/${product.slug}`,
      images: [{ url: product.image, alt: product.imageAlt ?? product.name }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categoryRef = normalizeCategoryRef(product.category);
  const categorySlug = categoryRef.slug;
  const categoryMeta = categories.find(
    (item) => item.id === categorySlug || item.id === categoryRef.slug,
  );
  const href = categoryHref(categorySlug);
  const categoryLabel = categoryMeta?.title ?? categoryRef.title ?? "Catalogue";
  const related = await getRelatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.longDescription ?? product.description,
    image: `${siteConfig.url}${product.image}`,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/products/${product.slug}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView
        product={product}
        related={related}
        categoryLabel={categoryLabel}
        categoryHref={href}
      />
    </>
  );
}
