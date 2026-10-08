// import { AchievementMediaSection } from "@/components/home/AchievementMediaSection";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/catalog/placeholder";
import { CategorySection } from "@/components/home/CategorySection";
import { CelebrationBanner } from "@/components/home/CelebrationBanner";
// import { DeliveryPlatformRatings } from "@/components/home/DeliveryPlatformRatings";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { NavratriSpecials } from "@/components/home/NavratriSpecials";
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
  productCategorySlug,
  resolveCategorySlug,
} from "@/lib/catalog/aliases";
import {
  getCategoryListingProducts,
  getHomeCategoryTiles,
  getPublishedProducts,
  getSpecialAttentionCategories,
  isGajakCategoryPublished,
} from "@/lib/catalog/queries";
import { siteConfig, testimonials, trustItems } from "@/data/home";
import { thaliBuilderMeta, thaliCategoryGroups } from "@/data/thali-builder";
import { productTagLabels } from "@/lib/catalog/tags";
import {
  festiveTagSlug,
  parseFestiveSpecial,
} from "@/lib/catalog/festive";
import type { Product } from "@/types/catalog";

/**
 * ThaliBuilder is a client component, so every prop is serialised into the
 * HTML/RSC payload. Send only the fields it reads (not attributes, images,
 * long descriptions, or every variant).
 */
function slimForThali(product: Product): Product {
  const firstVariant = product.variants[0];
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    tagline: product.tagline,
    image: product.image,
    imageAlt: product.imageAlt,
    thaliImage: product.thaliImage,
    variants: firstVariant
      ? [{ id: firstVariant.id, sku: firstVariant.sku } as Product["variants"][number]]
      : [],
  } as Product;
}

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
    festiveBlock,
    thaliByGroup,
    gajakLive,
    giftingAll,
  ] = await Promise.all([
    getPublishedProducts(),
    getHeroCarouselContent("home"),
    getSpecialAttentionCategories(),
    getHomeCategoryTiles(),
    // getAchievementMediaContent(),
    getVideoTestimonials(),
    getContentBlock("home", "thali_offer"),
    getContentBlock("home", "festive_special"),
    Promise.all(
      thaliCategoryGroups.map((group) =>
        getCategoryListingProducts(group.categorySlug, null),
      ),
    ),
    isGajakCategoryPublished(),
    getCategoryListingProducts("gifting", null),
  ]);
  const giftingProducts = giftingAll.slice(0, 4);
  const featuredProducts = allProducts.slice(0, 8);
  const thaliGroups = gajakLive
    ? thaliCategoryGroups
    : thaliCategoryGroups.filter((group) => group.id !== "gajak");
  const festive = parseFestiveSpecial(festiveBlock?.content);
  const festiveTagLower = (festive.collectionTag || "navratri").toLowerCase();
  const navratriProducts = allProducts.filter((product) =>
    productTagLabels(product).some((tag) => tag.toLowerCase() === festiveTagLower),
  );
  const pickedFestive = festive.productIds
    .map((id) => allProducts.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
  const navratriPicks =
    pickedFestive.length > 0
      ? pickedFestive
      : navratriProducts.length > 0
        ? navratriProducts
        : allProducts.filter(
          (product) =>
            product.seasonal ||
            productTagLabels(product).some(
              (tag) => tag.toLowerCase() === "seasonal",
            ),
        );

  const thaliDiscountPercent =
    (thaliOfferBlock?.content as { discountPercent?: number } | null)
      ?.discountPercent ?? thaliBuilderMeta.defaultDiscountPercent;

  /**
   * A handful of products per category card (see thaliCategoryGroups), so
   * each card has real choices and "View More" is meaningful. Fetched with
   * getCategoryListingProducts, the exact function /catalogue/[category]
   * itself uses, rather than filtered out of the flat published-products
   * list (whose category field isn't reliably resolvable for every
   * category here) or the simpler getProductsByCategory (which, for
   * "gajak", only covers the legacy category and misses products now
   * modeled as a sweets subcategory, getCategoryListingProducts already
   * handles that union). If the curated groups don't add up to at least
   * `slotCount` products (small/seed catalogues). Slot search uses the full
   * published catalogue (`allProducts`) so any item can be placed on the thali.
   */
  const thaliGroupedIds: Record<string, string[]> = {};
  const thaliPickedIds = new Set<string>();
  thaliCategoryGroups.forEach((group, i) => {
    if (!gajakLive && group.id === "gajak") return;
    const picked = (thaliByGroup[i] ?? [])
      .filter((p) => !thaliPickedIds.has(p.id));
    thaliGroupedIds[group.id] = picked.map((p) => p.id);
    for (const p of picked) {
      thaliPickedIds.add(p.id);
    }
  });
  const specialKeys = new Set(
    specialAttention.map((c) => categoryKeyFromHref(c.href)),
  );
  const homeCategories = categoryTiles
    .filter((category) => gajakLive || category.slug !== "gajak")
    .map((category) => {
      const sample = allProducts.find(
        (product) => productCategorySlug(product) === category.slug,
      );
      // Bakery tile uses a cleaner, circle-friendly product photo (display-only).
      const isBakeryTile = category.slug === "bakery";
      return {
        id: category.id,
        title: category.title,
        href: category.href,
        image: isBakeryTile
          ? "https://rsqktcygdsjfullapjrq.supabase.co/storage/v1/object/public/media/products/1790591091756-2i6qfvmo04e.webp"
          : category.image || sample?.image || PRODUCT_PLACEHOLDER_IMAGE,
        imageAlt: isBakeryTile
          ? "Bakery, Almond Biscotti"
          : sample?.imageAlt || category.title,
        specialAttention: category.featured || specialKeys.has(category.slug),
      };
    });

  /** Prefer the live category route when a featured category matches. */
  const specialForBanner = specialAttention
    .filter((item) => gajakLive || categoryKeyFromHref(item.href) !== "gajak")
    .map((item) => {
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
        sameAs: [siteConfig.social.instagram, siteConfig.social.facebook],
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
        {siteConfig.name}, Authentic Rajasthani namkeens, mithai, and festive hampers
      </h1>
      <HeroCarousel slides={heroSlides} />
      <TrustStrip items={trustItems} />
      <ThaliBuilder
        products={allProducts.map(slimForThali)}
        groupedIds={thaliGroupedIds}
        slotCount={thaliBuilderMeta.slotCount}
        discountPercent={thaliDiscountPercent}
        categoryGroups={thaliGroups}
      />
      <CategorySection categories={homeCategories} />
      <NavratriSpecials
        products={navratriPicks}
        content={{
          ...festive,
          buttonHref:
            festive.collectionTag && festive.buttonHref === "/catalogue"
              ? `/catalogue/${festiveTagSlug(festive.collectionTag)}`
              : festive.buttonHref,
        }}
      />
      <FeaturedProducts products={featuredProducts} />
      <HeritageSection />
      <SignatureCollections products={giftingProducts} />
      <CelebrationBanner specialAttention={specialForBanner} />
      {/* <DeliveryPlatformRatings /> */}
      <TestimonialsSection items={testimonials} videos={videos} />
      {/* <AchievementMediaSection content={achievementMedia} /> */}
      <NewsletterSection />
    </main>
  );
}