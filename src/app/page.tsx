import { AchievementMediaSection } from "@/components/home/AchievementMediaSection";
import { CategorySection } from "@/components/home/CategorySection";
import { CelebrationBanner } from "@/components/home/CelebrationBanner";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HeritageSection } from "@/components/home/HeritageSection";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { PuritySection } from "@/components/home/PuritySection";
import { SignatureCollections } from "@/components/home/SignatureCollections";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TrustStrip } from "@/components/home/TrustStrip";
import {
  getAchievementMediaContent,
  getHeroCarouselContent,
  getVideoTestimonials,
} from "@/lib/admin/queries";
import {
  getHomeCategoryTiles,
  getPublishedProducts,
  getSpecialAttentionCategories,
} from "@/lib/catalog/queries";
import { productCategorySlug, resolveCategorySlug } from "@/lib/catalog/aliases";
import {
  signatures,
  siteConfig,
  testimonials,
  trustItems,
} from "@/data/home";

function categoryKeyFromHref(href: string): string {
  const cleaned = href.replace(/\/$/, "");
  const segment = cleaned.includes("/catalogue/")
    ? (cleaned.split("/catalogue/")[1] ?? cleaned)
    : cleaned.replace(/^\//, "");
  const first = segment.split("/")[0] ?? segment;
  return resolveCategorySlug(first) ?? first.toLowerCase();
}

export default async function HomePage() {
  const [
    allProducts,
    heroSlides,
    specialAttention,
    categoryTiles,
    achievementMedia,
    videos,
  ] = await Promise.all([
    getPublishedProducts(),
    getHeroCarouselContent("home"),
    getSpecialAttentionCategories(),
    getHomeCategoryTiles(),
    getAchievementMediaContent(),
    getVideoTestimonials(),
  ]);
  const featuredProducts = allProducts.slice(0, 8);
  const specialKeys = new Set(
    specialAttention.map((c) => categoryKeyFromHref(c.href)),
  );
  const homeCategories = categoryTiles.map((category) => {
    const sample = allProducts.find(
      (product) => productCategorySlug(product) === category.slug,
    );
    return {
      id: category.id,
      title: category.title,
      href: category.href,
      image: category.image || sample?.image || "/images/prod0.jpg",
      imageAlt: sample?.imageAlt || category.title,
      specialAttention: category.featured || specialKeys.has(category.slug),
    };
  });

  /** Prefer the live category route when a featured category matches. */
  const specialForBanner = specialAttention.map((item) => {
    const key = categoryKeyFromHref(item.href);
    const match = homeCategories.find(
      (category) => categoryKeyFromHref(category.href) === key,
    );
    return {
      ...item,
      href: match?.href ?? item.href,
    };
  });

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
      <HeroCarousel slides={heroSlides} />
      <TrustStrip items={trustItems} />
      <CategorySection categories={homeCategories} />
      <FeaturedProducts products={featuredProducts} />
      <HeritageSection />
      <SignatureCollections items={signatures} />
      <CelebrationBanner specialAttention={specialForBanner} />
      <PuritySection />
      <TestimonialsSection items={testimonials} videos={videos} />
      <AchievementMediaSection content={achievementMedia} />
      <NewsletterSection />
    </main>
  );
}
