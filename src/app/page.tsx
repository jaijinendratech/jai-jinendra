import { CategorySection } from "@/components/home/CategorySection";
import { CelebrationBanner } from "@/components/home/CelebrationBanner";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HeritageSection } from "@/components/home/HeritageSection";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { InstagramSection } from "@/components/home/InstagramSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { PuritySection } from "@/components/home/PuritySection";
import { SignatureCollections } from "@/components/home/SignatureCollections";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TrustStrip } from "@/components/home/TrustStrip";
import { getPublishedProducts } from "@/lib/catalog/queries";
import {
  categories,
  instagramPosts,
  signatures,
  siteConfig,
  testimonials,
  trustItems,
} from "@/data/home";

export default async function HomePage() {
  const allProducts = await getPublishedProducts();
  const featuredProducts = allProducts.slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}${siteConfig.logo.src}`,
        foundingDate: String(siteConfig.founded),
        email: siteConfig.email,
        telephone: siteConfig.phone,
        sameAs: [siteConfig.social.instagram],
      },
      {
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteConfig.url}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "ItemList",
        name: "Customer Favourites",
        itemListElement: featuredProducts.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: `${siteConfig.url}${product.image}`,
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: product.price,
              availability: "https://schema.org/InStock",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviewCount,
            },
          },
        })),
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">
        {siteConfig.name} — Authentic Rajasthani namkeens, mithai, and festive hampers
      </h1>
      <HeroCarousel />
      <TrustStrip items={trustItems} />
      <CategorySection categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <HeritageSection />
      <SignatureCollections items={signatures} />
      <CelebrationBanner />
      <PuritySection />
      <TestimonialsSection items={testimonials} />
      <InstagramSection posts={instagramPosts} />
      <NewsletterSection />
    </main>
  );
}
