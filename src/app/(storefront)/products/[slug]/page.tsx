import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog/queries";
import { categoryHref, normalizeCategoryRef } from "@/lib/catalog/aliases";
import { categories, siteConfig } from "@/data/home";
import { isSupabaseConfigured } from "@/lib/env";
import { absoluteUrl, plainText, productInStock } from "@/lib/seo";

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
  const description = plainText(
    product.seoDescription ?? product.description,
    160,
  );

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: absoluteUrl(`/products/${product.slug}`),
      images: [
        {
          url: absoluteUrl(product.image),
          alt: product.imageAlt ?? product.name,
        },
      ],
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

  const pageUrl = absoluteUrl(`/products/${product.slug}`);
  const sku = product.variants.find((variant) => variant.sku)?.sku;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        description: plainText(
          product.longDescription ?? product.description,
          5000,
        ),
        image: [absoluteUrl(product.image)],
        sku,
        brand: { "@type": "Brand", name: siteConfig.name },
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: product.price,
          availability: productInStock(product.variants)
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: pageUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: categoryLabel,
            item: absoluteUrl(href),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: pageUrl,
          },
        ],
      },
    ],
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
