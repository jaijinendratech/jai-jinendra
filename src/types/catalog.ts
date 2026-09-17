export type NavLink = {
  label: string;
  href: string;
  highlight?: boolean;
};

export type CategoryId =
  | "namkeens"
  | "kachoris"
  | "mithai"
  | "gifts"
  | "tea-time"
  | "dry-fruits"
  | "combos";

export type Category = {
  id: CategoryId;
  title: string;
  mobileTitle?: string;
  subtitle: string;
  href: string;
  image: string;
  imageAlt: string;
};

export type ProductVariant = {
  id: string;
  label: string;
  price?: number;
  sku?: string;
  variantId?: string;
  stockQty?: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  image: string;
  imageAlt: string;
  price: number;
  originalPrice?: number;
  discountLabel?: string;
  badge?: string;
  tagline?: string;
  rating: number;
  reviewCount: number;
  category: CategoryId | "all";
  variants: ProductVariant[];
  ctaNote?: string;
  dietary?: string[];
  spiceNote?: "mild" | "medium" | "teekha" | "chatpata";
  ingredients?: string[];
  shelfLife?: string;
  origin?: string;
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
