import images from "@/data/image-map.json";
import type {
  Category,
  FooterColumn,
  InstagramPost,
  NavLink,
  Product,
  PurityPillar,
  SignatureCollection,
  Testimonial,
  TrustItem,
} from "@/types/catalog";

export const siteConfig = {
  name: "Jai Jinendra Namkeens",
  legalName: "Jai Jinendra Namkeens",
  tagline: "Artisanal Savouries & Royal Sweets",
  description:
    "Authentic Rajasthani namkeens, mithai, and festive hampers — freshly fried, nitrogen-sealed, and delivered pan-India. 100% shuddh vegetarian since 1982.",
  url: "https://jaijinendra.com",
  phone: "+91 1800-JAI-NAMKEEN",
  email: "hello@jaijinendra.com",
  fssai: "10020014002931",
  founded: 1982,
  social: {
    instagram: "https://instagram.com/JaiJinendraNamkeens",
  },
  announcement:
    "FREE PAN-INDIA DELIVERY ON ORDERS ABOVE ₹999 • Freshly Handcrafted & Nitrogen Packed • 100% Shuddh Shakahari (Pure Vegetarian)",
  announcementMobile: "Free delivery above ₹999 · Fresh & nitrogen-packed · 100% Pure Veg",
  logo: {
    src: "/brand/logo-namkeens.png",
    alt: "Jai Jinendra Namkeens — Sweets, Namkeens, Bakery",
    width: 1774,
    height: 887,
  },
  logoMark: {
    src: "/brand/logo-mark.png",
    alt: "Jai Jinendra mark",
    width: 543,
    height: 480,
  },
  brandLogo: {
    src: "/brand/logo.png",
    alt: "Jai Jinendra — Sweets, Namkeens, Bakery",
    width: 1774,
    height: 887,
  },
} as const;

export const navLinks: NavLink[] = [
  { label: "Namkeens", href: "/catalogue/namkeens", highlight: true },
  { label: "Sweets", href: "/sweets" },
  { label: "Kachori & Snacks", href: "/kachoris" },
  { label: "Gift Hampers", href: "/hampers" },
  { label: "Combos", href: "/combos" },
];

export const heroSlides = [
  {
    id: "diwali",
    src: images.bannerHomeDiwali,
    alt: "Celebrate the Joy of Diwali - Authentic Indian Festive Treats - Jai Jinendra Namkeens",
  },
  {
    id: "namkeen",
    src: images.bannerHomeNamkeen,
    alt: "Crisp. Savory. Authentic. Handcrafted Rajasthani Namkeens - Jai Jinendra Namkeens",
  },
] as const;

export const trustItems: TrustItem[] = [
  {
    id: "ingredients",
    title: "Premium Ingredients",
    mobileTitle: "Pure Ingredients",
    description: "Single-origin spices & 100% pure desi ghee.",
    mobileDescription: "Desi ghee & single-origin spices",
    icon: "eco",
  },
  {
    id: "packed",
    title: "Freshly Packed",
    mobileTitle: "Fresh Daily",
    description: "Small batch daily fry with nitrogen seals.",
    mobileDescription: "Nitrogen-sealed same day",
    icon: "package",
  },
  {
    id: "shuddh",
    title: "100% Pure Shuddh",
    mobileTitle: "100% Pure Veg",
    description: "Strict pure-veg dedicated kitchen facility.",
    mobileDescription: "Dedicated shuddh kitchen",
    icon: "veg",
  },
  {
    id: "shipping",
    title: "Pan-India Express",
    mobileTitle: "Pan-India",
    description: "Dispatched in 24 hrs to 26,000+ pin codes.",
    mobileDescription: "Dispatched in 24 hrs",
    icon: "shipping",
  },
];

export const categories: Category[] = [
  {
    id: "namkeens",
    title: "Namkeens & Farsan",
    mobileTitle: "Namkeens",
    subtitle: "18 Varieties",
    href: "/catalogue/namkeens",
    image: images.cat0,
    imageAlt:
      "Golden crispy Ratlami sev and Rajasthani spicy bhujia overflowing from an earthenware katori",
  },
  {
    id: "kachoris",
    title: "Khasta Kachori & Samosa",
    mobileTitle: "Kachoris",
    subtitle: "8 Fresh Batches",
    href: "/kachoris",
    image: images.cat1,
    imageAlt: "Flaky golden Jodhpur dal kachori with coriander and tamarind chutneys",
  },
  {
    id: "mithai",
    title: "Traditional Mithai",
    mobileTitle: "Mithai",
    subtitle: "14 Sweets",
    href: "/sweets",
    image: images.cat2,
    imageAlt: "Silver leaf Kaju Katli arranged in a tiered presentation box",
  },
  {
    id: "gifts",
    title: "Festive Hampers",
    mobileTitle: "Hampers",
    subtitle: "12 Curations",
    href: "/hampers",
    image: images.cat3,
    imageAlt: "Crimson and gold festive gift hamper with brass jars and silk ribbon",
  },
  {
    id: "tea-time",
    title: "Tea-Time Crunch",
    mobileTitle: "Tea-Time",
    subtitle: "9 Daily Staples",
    href: "/combos",
    image: images.cat4,
    imageAlt: "Butter khari and mathri beside a steaming kulhad of cutting chai",
  },
  {
    id: "dry-fruits",
    title: "Royal Dry Fruit Blends",
    mobileTitle: "Dry Fruits",
    subtitle: "10 Blends",
    href: "/catalogue/dry-fruits",
    image: images.cat5,
    imageAlt: "Roasted cashews, almonds, and pistachios in an elegant brass tray",
  },
];

export const productFilters = [
  { id: "all", label: "All" },
  { id: "namkeens", label: "Namkeens" },
  { id: "kachoris", label: "Kachoris" },
  { id: "mithai", label: "Mithai" },
  { id: "gifts", label: "Gift Boxes" },
] as const;

export const featuredProducts: Product[] = [
  {
    id: "shahi-kaju-mixture",
    name: "Shahi Kaju Mixture",
    slug: "shahi-kaju-mixture",
    description: "Whole roasted cashews, kishmish & crunchy sev.",
    image: images.prod0,
    imageAlt: "Shahi Kaju Mixture with cashews, raisins, and potato salli",
    price: 299,
    originalPrice: 349,
    discountLabel: "14% OFF",
    badge: "Bestseller",
    rating: 4.9,
    reviewCount: 1240,
    category: "namkeens",
    variants: [
      { id: "400g", label: "400g" },
      { id: "800g", label: "800g" },
      { id: "festive", label: "Festive Tin" },
    ],
  },
  {
    id: "jodhpur-khasta-dal-kachori",
    name: "Jodhpur Khasta Dal Kachori",
    slug: "jodhpur-khasta-dal-kachori",
    description: "Spiced yellow moong dal, hing & flaky crust.",
    image: images.prod1,
    imageAlt: "Stack of golden Jodhpur Khasta Dal Kachoris on terracotta",
    price: 240,
    badge: "Fresh Daily",
    rating: 4.8,
    reviewCount: 890,
    category: "kachoris",
    variants: [
      { id: "6", label: "Pack of 6" },
      { id: "12", label: "Pack of 12" },
    ],
    ctaNote: "Ready to Bake / Reheat",
  },
  {
    id: "silver-vark-kaju-katli",
    name: "Silver Vark Kaju Katli",
    slug: "silver-vark-kaju-katli",
    description: "Made with Goa cashews & certified veg vark.",
    image: images.prod2,
    imageAlt: "Silver Vark Kaju Katli diamonds in a velvet gift box",
    price: 550,
    originalPrice: 599,
    discountLabel: "8% OFF",
    badge: "Royal Sweet",
    rating: 5.0,
    reviewCount: 2100,
    category: "mithai",
    variants: [
      { id: "250g", label: "250g" },
      { id: "500g", label: "500g" },
      { id: "1kg", label: "1kg" },
    ],
  },
  {
    id: "ratlami-sev-hing-bhujia",
    name: "Ratlami Sev & Hing Bhujia",
    slug: "ratlami-sev-hing-bhujia",
    description: "Spiced with Laung, Kali Mirch & pure Hing.",
    image: images.prod3,
    imageAlt: "Ratlami Sev and Hing Bhujia poured into a brass bowl",
    price: 195,
    originalPrice: 220,
    discountLabel: "MRP ₹220",
    badge: "Classic",
    rating: 4.9,
    reviewCount: 1450,
    category: "namkeens",
    variants: [
      { id: "250g", label: "250g" },
      { id: "500g", label: "500g" },
      { id: "1kg", label: "1kg" },
    ],
  },
];

export const heritage = {
  eyebrow: "Generational Craft",
  title: "ROOTED IN TRADITION. MADE FOR TODAY.",
  mobileTitle: "Rooted in tradition. Made for today.",
  body: "Started in 1982 in the royal lanes of Rajasthan, Jai Jinendra Namkeens was founded on a simple sacred vow: uncompromised purity, freshly cold-pressed oils, hand-pounded spices, and zero preservatives. Every single batch of our signature Ratlami Sev, Hing Kachori, and Pure Ghee Mithai is prepared under strict shuddh vegetarian protocols in dedicated cleanrooms. When you open a packet anywhere in India, you savour the exact crisp crunch of our halwai ovens on the day it was fried.",
  mobileBody:
    "Since 1982 in Rajasthan — pure oils, hand-pounded spices, zero preservatives. Fresh crispness sealed for pan-India delivery.",
  cta: { label: "Our Story & Purity Standards", href: "/heritage" },
  mobileCta: "Our Story",
  image: images.heritage,
  imageAlt: "Artisanal halwai roasting whole Indian spices in a brass kadhai",
  stats: [
    { value: "40+", label: "Years Generational Halwai Heritage", mobileLabel: "Years of heritage" },
    { value: "1M+", label: "Homes Pan-India Dispatches Served", mobileLabel: "Homes served" },
  ],
} as const;

export const signatures: SignatureCollection[] = [
  {
    id: "royal-rajasthan",
    eyebrow: "Heritage Box",
    title: "Royal Rajasthan Heritage Box",
    mobileTitle: "Royal Rajasthan Box",
    description:
      "A regal trio of spicy Bikaneri bhujia, flaky mathri, and mini desi ghee ghevar pieces.",
    mobileDescription: "Bhujia, mathri & ghee ghevar.",
    price: 890,
    netWeight: "1.2 kg",
    href: "/products/royal-rajasthan-heritage-box",
    image: images.sig0,
    imageAlt: "Royal Rajasthan Heritage gift box with bhujia, mathri, and ghevar",
  },
  {
    id: "aristocrat-mithai",
    eyebrow: "Luxury Mithai",
    title: "The Aristocrat Mithai Trunk",
    mobileTitle: "Aristocrat Mithai Trunk",
    description:
      "Signature velvet trunk packed with Kesar Peda, Silver Kaju Katli, and Mewa Bites.",
    mobileDescription: "Kesar Peda, Kaju Katli & Mewa Bites.",
    price: 1450,
    netWeight: "1.0 kg",
    href: "/products/aristocrat-mithai-trunk",
    image: images.sig1,
    imageAlt: "Aristocrat Mithai Trunk with kaju katli and kesar peda",
  },
  {
    id: "chai-nashta",
    eyebrow: "Family Bundle",
    title: "Chai-Nashta Daily Essentials",
    mobileTitle: "Chai-Nashta Essentials",
    description:
      "Everyday morning rituals sorted: Butter Khari, Jeera Biscuits, and Special Mixture.",
    mobileDescription: "Khari, jeera biscuits & mixture.",
    price: 640,
    netWeight: "900g",
    href: "/combos",
    image: images.sig2,
    imageAlt: "Chai-Nashta breakfast snack hamper in kraft canisters",
  },
];

export const celebrationBanner = {
  eyebrow: "Diwali • Weddings • Corporate",
  title: "MAKE EVERY CELEBRATION SWEETER.",
  mobileTitle: "Make every celebration sweeter.",
  body: "Corporate gifting, wedding favours, and festive hampers customized with personalized brass seals, greeting cards, and bespoke sweet & savory combinations. Delivered directly to your clients and guests anywhere across India.",
  mobileBody:
    "Festive hampers & corporate gifts — custom seals, delivered pan-India.",
  backgroundImage: images.banner,
  primaryCta: { label: "Explore Gift Hampers", href: "/hampers", mobileLabel: "Shop Hampers" },
  secondaryCta: { label: "Corporate Enquiries", href: "/corporate", mobileLabel: "Corporate" },
} as const;

export const purityPillars: PurityPillar[] = [
  {
    id: "ghee",
    title: "100% Pure Ghee & Kacchi Ghani",
    subtitle: "A2 Bilona Purity",
    detail: "0% Palm Oil • Zero Trans Fats • Freshly Pressed",
    badge: "Cold-Pressed Heritage",
    icon: "droplet",
  },
  {
    id: "masale",
    title: "Stone-Pounded Masale",
    subtitle: "No Added Flavours",
    detail: "Hathras Hing • Mathania Chillies • Fresh Ground",
    badge: "Single-Origin Spices",
    icon: "grain",
  },
  {
    id: "cleanroom",
    title: "Dedicated Cleanroom Bay",
    subtitle: "100% Shuddh Ahimsa",
    detail: "Strict Pure Veg • Zero Cross-Contact • Halwai Heritage",
    badge: "Jain Protocol Compliant",
    icon: "spa",
  },
  {
    id: "seal",
    title: "90-Day Hermetic Seal",
    subtitle: "Zero Preservatives",
    detail: "Nitrogen Flushed • 0% Moisture • Doorstep Crisp",
    badge: "Pan-India Freshness",
    icon: "lock",
  },
];

export const purityBadges = [
  "Grade-A FSSAI Certified",
  "Handmade in Small Batches",
  "100% Ahimsa Vegetarian",
  "Triple Moisture Barrier",
] as const;

export const testimonials: Testimonial[] = [
  {
    id: "ananya",
    quote:
      "Finding authentic Ratlami Sev that has that genuine kick of clove and pure hing in Bengaluru was impossible until I ordered from Jai Jinendra. The nitrogen sealing keeps it crunchier than local stores.",
    mobileQuote:
      "Authentic Ratlami Sev with real hing kick — nitrogen seal keeps it crunchier than local stores.",
    name: "Ananya Kulkarni",
    location: "Bengaluru, Karnataka",
    rating: 5,
  },
  {
    id: "rajesh",
    quote:
      "We ordered 120 custom hamper boxes for our corporate Diwali gifts across 14 cities. Every box reached safely without a single damaged kachori or cracked sweet. Unbelievable standard of packing!",
    mobileQuote:
      "120 Diwali hampers across 14 cities — every box arrived safe. Outstanding packing.",
    name: "Rajesh Singhania",
    location: "Gurugram, Delhi NCR",
    rating: 5,
  },
  {
    id: "pooja",
    quote:
      "The Kaju Katli melts instantly on your tongue. Knowing that their vark is 100% certified vegetarian and prepared in a strict shuddh shakahari environment gives my elderly parents complete peace of mind.",
    mobileQuote:
      "Kaju Katli melts on the tongue — certified veg vark gives our parents peace of mind.",
    name: "Pooja Chhabra",
    location: "South Mumbai",
    rating: 5,
  },
];

export const instagramPosts: InstagramPost[] = [
  {
    id: "1",
    image: images.ig0,
    imageAlt: "Masala chai with mathri flatlay",
    href: "https://instagram.com/JaiJinendraNamkeens",
  },
  {
    id: "2",
    image: images.ig1,
    imageAlt: "Roasted cashews with Kashmiri chilli",
    href: "https://instagram.com/JaiJinendraNamkeens",
  },
  {
    id: "3",
    image: images.ig2,
    imageAlt: "Opening a festive gift box during Diwali",
    href: "https://instagram.com/JaiJinendraNamkeens",
  },
  {
    id: "4",
    image: images.ig3,
    imageAlt: "Halwai folding kachori dough by hand",
    href: "https://instagram.com/JaiJinendraNamkeens",
  },
  {
    id: "5",
    image: images.ig4,
    imageAlt: "Sev and bhujia in paper cones at a garden tea party",
    href: "https://instagram.com/JaiJinendraNamkeens",
  },
  {
    id: "6",
    image: images.ig5,
    imageAlt: "Festive family dinner with kachoris and laddoos",
    href: "https://instagram.com/JaiJinendraNamkeens",
  },
];

export const newsletter = {
  eyebrow: "Welcome Offer",
  title: "Get ₹100 Off Your First Order.",
  mobileTitle: "₹100 off your first order",
  body: "Subscribe for festive drop announcements, secret halwai recipes, and members-only weekend tasting boxes.",
  mobileBody: "Festive drops, recipes & member tasting boxes.",
  cta: "Claim Offer",
  mobileCta: "Claim",
  disclaimer: "Pure indulgence only. No spam ever.",
} as const;

export const footerBrand = {
  body: "Authentic generational craftsmanship from Rajasthan, bringing pure desi ghee sweets, hand-pounded spices, and nitrogen-sealed namkeens directly to discerning homes across India.",
  mobileBody: "Rajasthani namkeens & mithai — pure ghee, nitrogen-sealed, pan-India.",
} as const;

export const footerColumns: FooterColumn[] = [
  {
    title: "Our Delicacies",
    links: [
      { label: "Namkeens & Farsan", href: "/catalogue/namkeens" },
      { label: "Traditional Sweets", href: "/sweets" },
      { label: "Festive Hampers", href: "/hampers" },
      { label: "Chai-Nashta Combos", href: "/combos" },
      { label: "Royal Dry Fruit Blends", href: "/catalogue/dry-fruits" },
      { label: "Full Catalogue", href: "/catalogue" },
    ],
  },
  {
    title: "The Promise",
    links: [
      { label: "Our Heritage Story", href: "/heritage" },
      { label: "Purity & Lab Testing", href: "/purity" },
      { label: "Pan-India Freshness Guarantee", href: "/freshness" },
      { label: "Corporate Gifting Desk", href: "/corporate" },
      { label: "Our Flagship Outlets", href: "/outlets" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Track Order", href: "/track-order" },
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "Customer Support FAQs", href: "/support" },
      { label: "Terms & Privacy", href: "/terms-privacy" },
    ],
  },
];
