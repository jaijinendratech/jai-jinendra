import { CategorySection } from "@/components/home/CategorySection";
import { CelebrationBanner } from "@/components/home/CelebrationBanner";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HeritageSection } from "@/components/home/HeritageSection";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { InstagramSection } from "@/components/home/InstagramSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ThaliBuilder } from "@/components/home/ThaliBuilder";
import { SignatureCollections } from "@/components/home/SignatureCollections";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TrustStrip } from "@/components/home/TrustStrip";
import { getContentBlock, getHeroCarouselContent } from "@/lib/admin/queries";
import {
  getCategoryListingProducts,
  getPublishedProducts,
  getSpecialAttentionCategories,
} from "@/lib/catalog/queries";
import { resolveCategorySlug } from "@/lib/catalog/aliases";
import {
  categories,
  instagramPosts,
  signatures,
  siteConfig,
  testimonials,
  trustItems,
} from "@/data/home";
import { thaliBuilderMeta, thaliCategoryGroups } from "@/data/thali-builder";

function categoryKeyFromHref(href: string): string {
  const cleaned = href.replace(/\/$/, "");
  const segment = cleaned.includes("/catalogue/")
    ? (cleaned.split("/catalogue/")[1] ?? cleaned)
    : cleaned.replace(/^\//, "");
  const first = segment.split("/")[0] ?? segment;
  return resolveCategorySlug(first) ?? first.toLowerCase();
}

export default async function HomePage() {
  const [allProducts, heroSlides, specialAttention, thaliOfferBlock, thaliByGroup] =
    await Promise.all([
      getPublishedProducts(),
      getHeroCarouselContent("home"),
      getSpecialAttentionCategories(),
      getContentBlock("home", "thali_offer"),
      Promise.all(
        thaliCategoryGroups.map((group) =>
          getCategoryListingProducts(group.categorySlug, null),
        ),
      ),
    ]);
  const featuredProducts = allProducts.slice(0, 8);

  const thaliDiscountPercent =
    (thaliOfferBlock?.content as { discountPercent?: number } | null)
      ?.discountPercent ?? thaliBuilderMeta.defaultDiscountPercent;

  /**
   * A handful of products per category card (see thaliCategoryGroups), so
   * each card has real choices and "View More" is meaningful. Fetched with
   * getCategoryListingProducts — the exact function /catalogue/[category]
   * itself uses — rather than filtered out of the flat published-products
   * list (whose category field isn't reliably resolvable for every
   * category here) or the simpler getProductsByCategory (which, for
   * "gajak", only covers the legacy category and misses products now
   * modeled as a sweets subcategory — getCategoryListingProducts already
   * handles that union). If the curated groups don't add up to at least
   * `slotCount` products (small/seed catalogues), top up from the rest of
   * the catalogue so the thali can still be completed — top-up items won't
   * necessarily appear in a category card, but guarantee the thali itself
   * stays completable.
   */
  const thaliCurated: typeof allProducts = [];
  const thaliCuratedIds = new Set<string>();
  const thaliGroupedIds: Record<string, string[]> = {};
  thaliCategoryGroups.forEach((group, i) => {
    const picked = (thaliByGroup[i] ?? [])
      .filter((p) => !thaliCuratedIds.has(p.id))
      .slice(0, thaliBuilderMeta.poolItemsPerGroup);
    thaliGroupedIds[group.id] = picked.map((p) => p.id);
    for (const p of picked) {
      thaliCurated.push(p);
      thaliCuratedIds.add(p.id);
    }
  });
  const thaliTopUp = allProducts.filter((p) => !thaliCuratedIds.has(p.id));
  const thaliPoolSize = Math.max(
    thaliBuilderMeta.slotCount,
    thaliCurated.length,
  );
  const thaliProducts = [...thaliCurated, ...thaliTopUp].slice(
    0,
    thaliPoolSize,
  );
  const specialKeys = new Set(
    specialAttention.map((c) => categoryKeyFromHref(c.href)),
  );
  const homeCategories = categories.map((c) => ({
    ...c,
    specialAttention: specialKeys.has(categoryKeyFromHref(c.href)),
  }));

  /** Prefer storefront routes (e.g. /sweets) over generic /catalogue/… when possible. */
  const specialForBanner = specialAttention.map((item) => {
    const key = categoryKeyFromHref(item.href);
    const match = categories.find((c) => categoryKeyFromHref(c.href) === key);
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
      <ThaliBuilder
        products={thaliProducts}
        groupedIds={thaliGroupedIds}
        slotCount={thaliBuilderMeta.slotCount}
        discountPercent={thaliDiscountPercent}
      />
      <TestimonialsSection items={testimonials} />
      <InstagramSection posts={instagramPosts} />
      <NewsletterSection />
    </main>
  );
}
