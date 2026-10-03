export type NavLink = {
  label: string;
  href: string;
  highlight?: boolean;
};

/** Storefront category identifiers (canonical + legacy). */
export type CategoryId =
  | "sweets"
  | "namkeen"
  | "bakery"
  | "tea-time-bites"
  | "dry-cakes"
  | "cookies"
  | "gajak"
  | "gifting"
  | "namkeens"
  | "kachoris"
  | "mithai"
  | "gifts"
  | "tea-time"
  | "dry-fruits"
  | "combos";

export type SellingUnit = "g" | "kg" | "pack" | "pc" | "other";

export type CategoryRef = {
  slug: string;
  title: string;
};

export type SubcategoryRef = {
  slug: string;
  title: string;
};

export type ProductAttribute = {
  key: string;
  label: string;
  value: unknown;
  dataType?: string;
  filterable?: boolean;
  filterGroup?: string | null;
};

export type ProductVariant = {
  /** Variant UUID — cart must use this. */
  id: string;
  label: string;
  sellingUnit?: SellingUnit;
  quantityValue?: number | null;
  price?: number;
  originalPrice?: number;
  sku?: string;
  stockQty?: number;
  available?: boolean;
  /** Legacy alias for cart code paths. */
  variantId?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: CategoryRef | CategoryId;
  subcategory?: SubcategoryRef | null;
  image: string;
  /** Landing-page thali plate only. Listings keep `image`. */
  thaliImage?: string;
  /** Global storefront position. Lower comes first. */
  sortOrder?: number;
  imageAlt?: string;
  images?: { src: string; alt?: string }[];
  badge?: string;
  /** Merchandising labels. The card and detail badge prefer these over `badge`. */
  tags?: string[];
  highlights?: string[];
  shippingTitle?: string;
  shippingNote?: string;
  tagline?: string;
  featured?: boolean;
  seasonal?: boolean;
  attributes?: ProductAttribute[];
  variants: ProductVariant[];
  /** Min available variant price (₹). */
  price: number;
  originalPrice?: number;
  discountLabel?: string;
  /** SEO fields when present in DB. */
  seoTitle?: string;
  seoDescription?: string;
  /** Legacy fields retained for storefront compatibility. */
  rating: number;
  reviewCount: number;
  ctaNote?: string;
  dietary?: string[];
  spiceNote?: "mild" | "medium" | "teekha" | "chatpata";
  ingredients?: string[];
  shelfLife?: string;
  origin?: string;
};

export type Category = {
  id: CategoryId;
  title: string;
  mobileTitle?: string;
  subtitle: string;
  href: string;
  image: string;
  imageAlt: string;
  /** Featured / special-attention — show star badge on cards & nav. */
  specialAttention?: boolean;
};

export type SignatureCollection = {
  id: string;
  eyebrow: string;
  title: string;
  mobileTitle?: string;
  description: string;
  mobileDescription?: string;
  price: number;
  netWeight: string;
  image: string;
  imageAlt: string;
  href: string;
};

export type TrustItem = {
  id: string;
  title: string;
  mobileTitle?: string;
  description: string;
  mobileDescription?: string;
  icon: "eco" | "package" | "veg" | "shipping" | "swiggy" | "zomato";
  /** Small pill shown next to the title, e.g. "100% Pure", "★ 4.5+". */
  badge?: string;
};

export type PurityPillar = {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  badge: string;
  icon: "droplet" | "grain" | "spa" | "lock";
};

export type Testimonial = {
  id: string;
  quote: string;
  mobileQuote?: string;
  name: string;
  location: string;
  rating: number;
};

export type AchievementMediaItem = {
  id: string;
  src: string;
  alt: string;
};

export type AchievementMedia = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  items: AchievementMediaItem[];
};

export type VideoTestimonial = {
  id: string;
  videoUrl: string;
  posterUrl: string;
  name: string;
  location: string;
  quote: string;
};

export type AchievementPageItem = {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl: string;
};

export type AchievementPageContent = {
  intro: { title: string; body: string };
  items: AchievementPageItem[];
};

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export type CataloguePill = {
  id: CategoryId | "all";
  label: string;
  mobileLabel?: string;
  count: number;
  icon: "menu" | "bakery" | "lunch" | "cookie" | "gift" | "cafe";
};

export type CatalogueFilterOption = {
  id: string;
  label: string;
  count?: number;
};

export type PriceRangeOption = {
  id: string;
  label: string;
  min: number;
  max: number;
};
