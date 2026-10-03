// import { AchievementMediaSection } from "@/components/home/AchievementMediaSection";
import { CategorySection } from "@/components/home/CategorySection";
import { CelebrationBanner } from "@/components/home/CelebrationBanner";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HeritageSection } from "@/components/home/HeritageSection";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { SignatureCollections } from "@/components/home/SignatureCollections";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { ThaliBuilder } from "@/components/home/ThaliBuilder";
import { TrustStrip } from "@/components/home/TrustStrip";
import {
  // getAchievementMediaContent,
  getContentBlock,
  getHeroCarouselContent,
  getVideoTestimonials,
} from "@/lib/admin/queries";
import {
  categoryHref,
  productCategorySlug,
  resolveCategorySlug,
} from "@/lib/catalog/aliases";
import {
  getCategoryListingProducts,
  getHomeCategoryTiles,
  getPublishedProducts,
  getSpecialAttentionCategories,
} from "@/lib/catalog/queries";
import { signatures, siteConfig, testimonials, trustItems } from "@/data/home";
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
  const [
    allProducts,
    heroSlides,
    specialAttention,
    categoryTiles,
    // achievementMedia,
    videos,
    thaliOfferBlock,
    thaliByGroup,
  ] = await Promise.all([
    getPublishedProducts(),
    getHeroCarouselContent("home"),
    getSpecialAttentionCategories(),
    getHomeCategoryTiles(),
    // getAchievementMediaContent(),
    getVideoTestimonials(),
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
  const homeCategories = categoryTiles.map((category) => {
    const sample = allProducts.find(
      (product) => productCategorySlug(product) === category.slug,
    );
    // "Tea Time Bites" tile shown as "Bakery" with a cleaner, circle-friendly
    // product photo — display-only, no category/DB change (Bakery is a
    // virtual grouping, same as the navbar; see BAKERY_MEMBER_SLUGS). Links
    // to the grouped /catalogue/bakery route (covers Tea Time Bites + Dry
    // Cakes + Cookies), not the raw Tea Time Bites category route.
    const isBakeryTile = category.slug === "tea-time-bites";
    return {
      id: category.id,
      title: isBakeryTile ? "Bakery" : category.title,
      href: isBakeryTile ? categoryHref("bakery") : category.href,
      image: isBakeryTile
        ? "https://rsqktcygdsjfullapjrq.supabase.co/storage/v1/object/public/media/products/1790591091756-2i6qfvmo04e.webp"
        : category.image || sample?.image || "/images/prod0.jpg",
      imageAlt: isBakeryTile
        ? "Bakery — Almond Biscotti"
        : sample?.imageAlt || category.title,
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
      <ThaliBuilder
        products={thaliProducts}
        groupedIds={thaliGroupedIds}
        slotCount={thaliBuilderMeta.slotCount}
        discountPercent={thaliDiscountPercent}
      />
      <CategorySection categories={homeCategories} />
      <FeaturedProducts products={allProducts} />
      <HeritageSection />
      <SignatureCollections items={signatures} />
      <CelebrationBanner specialAttention={specialForBanner} />
      <TestimonialsSection items={testimonials} videos={videos} />
      {/* <AchievementMediaSection content={achievementMedia} /> */}
      <NewsletterSection />
    </main>
  );
}
