export type NavLink = {
  label: string;
  href: string;
  highlight?: boolean;
};

/** Storefront category identifiers (canonical + legacy). */
export type CategoryId =
  | "sweets"
  | "namkeen"
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
  imageAlt?: string;
  images?: { src: string; alt?: string }[];
  badge?: string;
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
  icon: "eco" | "package" | "veg" | "shipping";
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

export type InstagramPost = {
  id: string;
  image: string;
  imageAlt: string;
  href: string;
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
