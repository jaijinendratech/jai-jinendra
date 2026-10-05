import images from "@/data/image-map.json";
import { heritage, purityBadges, purityPillars, siteConfig } from "@/data/home";

export const promiseHubLinks = [
  {
    href: "/heritage",
    title: "Our Heritage Story",
    body: "Four decades of Marwari halwai craft from Rajasthan’s royal lanes.",
  },
  {
    href: "/purity",
    title: "Purity & Lab Testing",
    body: "Dedicated shuddh kitchens, cold-pressed oils, and FSSAI-grade protocols.",
  },
  {
    href: "/freshness",
    title: "Pan-India Freshness Guarantee",
    body: "Nitrogen seals, 24-hour dispatch, and our 100% Crispness Warranty.",
  },
  {
    href: "/corporate",
    title: "Corporate Gifting Desk",
    body: "Multi-address festive hampers, branding, and concierge dispatch.",
  },
  {
    href: "/outlets",
    title: "Our Flagship Outlets",
    body: "Heritage kitchen counters and seasonal metro pop-ups.",
  },
] as const;

export const heritagePage = {
  metaTitle: "Our Heritage Story",
  metaDescription: heritage.body,
  eyebrow: heritage.eyebrow,
  title: "Our Heritage Story",
  displayTitle: heritage.title,
  body: heritage.body,
  image: heritage.image,
  imageAlt: heritage.imageAlt,
  stats: heritage.stats,
  timeline: [
    {
      year: "1984",
      title: "Founded at Aerodrome Circle, Kota",
      body: "Established at Aerodrome Circle, Kota, Rajasthan, with much-loved Kota Kachoris and Namkeens — a trusted name among families across Kota and Rajasthan for distinctive taste, quality and consistency.",
    },
    {
      year: "1998",
      title: "Dedicated Shuddh Kitchen",
      body: "Separate cleanroom bays for namkeens and mithai, following strict Jain-friendly preparation principles.",
    },
    {
      year: "2012",
      title: "Nitrogen Seal Standard",
      body: "Medical-grade food nitrogen flushing becomes our pan-India crispness promise for every pouch and tin.",
    },
    {
      year: "Today",
      title: "Homes Across India",
      body: "Festive hampers, corporate trunks, and chai-nashta staples dispatched to 26,000+ pin codes within 24 hours of frying.",
    },
  ],
  craftPillars: [
    {
      title: "Stone-Pounded Masale",
      body: "Hathras hing, Mathania chillies, and single-origin spices ground fresh for each batch.",
    },
    {
      title: "Small-Batch Frying",
      body: "Kadhai craft in limited lots so every strand of sev keeps its signature crunch.",
    },
    {
      title: "Halwai Mithai Rituals",
      body: "Bilona cow ghee, slow roasting, and silver-vark finishing for royal festive sweets.",
    },
  ],
} as const;

export const purityPage = {
  metaTitle: "Purity & Lab Testing",
  metaDescription:
    "Learn how Jai Jinendra Sweets & Namkeens maintains 100% shuddh vegetarian kitchens, cold-pressed oils, lab-tested batches, and FSSAI certification.",
  eyebrow: "The Promise",
  title: "Purity & Lab Testing",
  intro: `Every batch from ${siteConfig.name} follows dedicated cleanroom protocols — pure vegetarian, cold-pressed oils, and nitrogen-sealed freshness.`,
  pillars: purityPillars,
  badges: purityBadges,
  labChecks: [
    {
      title: "Oil Integrity",
      body: "Cold-pressed kacchi ghani and A2 bilona ghee verified for freshness — never recycled frying oils.",
    },
    {
      title: "Moisture Barrier",
      body: "Post-pack moisture and oxygen residual checks before nitrogen flush and hermetic seal.",
    },
    {
      title: "Allergen Discipline",
      body: "Declared nuts and dairy handled in controlled bays with labelled cross-contact guidance.",
    },
    {
      title: "FSSAI Traceability",
      body: `Licensed unit ${siteConfig.fssai} with batch codes printed for full kitchen-to-doorstep traceability.`,
    },
  ],
  image: images.heritage,
  imageAlt: "Artisanal spices and clean kitchen craft at Jai Jinendra",
} as const;

export const freshnessPage = {
  metaTitle: "Pan-India Freshness Guarantee",
  metaDescription:
    "Nitrogen-sealed namkeens and mithai dispatched within 24 hours. Free pan-India delivery above ₹999 with 100% Crispness Warranty.",
  eyebrow: "Pan-India Promise",
  title: "Pan-India Freshness Guarantee",
  intro:
    "Fresh batches are fried, nitrogen-packed, and air-couriered so the crunch that leaves our kadhai arrives intact at your doorstep — from metros to tier-2 towns.",
  image: images.banner,
  imageAlt: "Festive gift boxes and fresh Indian snacks ready for pan-India dispatch",
  guarantees: [
    {
      title: "Nitrogen Sealed Freshness",
      body: "Locks in crunch and aromatic vapours without artificial preservatives.",
    },
    {
      title: "24-Hour Dispatch",
      body: "Orders leave the kitchen within a day of frying via premium express carriers.",
    },
    {
      title: "Free Delivery Threshold",
      body: "Complimentary pan-India shipping on orders above ₹999.",
    },
    {
      title: "100% Crispness Warranty",
      body: "If transit compromises crispness, we ship a free replacement — no questions asked.",
    },
  ],
  sla: [
    { label: "Metros (major)", value: "2–4 days" },
    { label: "Tier-2 / Tier-3", value: "3–6 days" },
    { label: "Festive peak", value: "Dispatch windows communicated at checkout" },
  ],
} as const;

export const corporatePage = {
  metaTitle: "Corporate Gifting Desk",
  metaDescription:
    "Corporate Diwali hampers, wedding favours, and multi-address festive gifting with branding, brass seals, and pan-India dispatch from Jai Jinendra Sweets & Namkeens.",
  eyebrow: "Bespoke B2B Gifting",
  title: "Corporate Gifting Desk",
  intro:
    "Curate embossed tins, brass-sealed trunks, and custom sweet–savory mixes for clients and teams across India. Volume pricing, branding options, and multi-address dispatch in one concierge desk.",
  image: images.catalogueGift,
  imageAlt: "Luxury corporate gift hamper with sweets and namkeens",
  benefits: [
    {
      title: "Multi-Address Dispatch",
      body: "Send hampers to guests and offices across 26,000+ pin codes from a single order sheet.",
    },
    {
      title: "Brand-Ready Finishes",
      body: "Optional logo cards, wax seals, and embossed tin personalisation for festive campaigns.",
    },
    {
      title: "Volume & MOQ Guidance",
      body: "Dedicated desk for 25+ unit programmes — Diwali, weddings, onboarding, and client appreciation.",
    },
    {
      title: "Quality SLAs",
      body: "Nitrogen-packed contents with the same Crispness Warranty as retail festive orders.",
    },
  ],
  packages: [
    { name: "Team Treat Box", from: 640, note: "Chai-nashta essentials for desk gifting" },
    { name: "Heritage Hamper", from: 890, note: "Signature savory + mithai assortment" },
    { name: "Aristocrat Trunk", from: 1450, note: "Luxury mithai keepsake for VIP clients" },
  ],
} as const;

export const cateringPage = {
  metaTitle: "Jain Catering by Jai Jinendra",
  metaDescription:
    "Authentic Jain catering for weddings, religious functions, and special events — no onion, no garlic, no potato. Pure Jain food with magical taste from Jai Jinendra Sweets & Namkeens.",
  eyebrow: "Events & Celebrations",
  title: "Jain Catering by Jai Jinendra – Pure Jain Food, Magical Taste",
  intro:
    "Looking for Jain catering for a wedding, religious function, family gathering or special event? Jai Jinendra offers authentic Jain food prepared according to Jain dietary protocols, with no onion, no garlic and no potato. Our experienced team focuses on delivering delicious, flavourful food without compromising on traditional Jain food practices.",
  image: images.bannerSweetsLaddu,
  imageAlt: "Assorted Jai Jinendra sweets arranged for an event",
  benefits: [
    {
      title: "Authentic Jain Catering",
      body: "No onion, no garlic, no potato + Magical taste.",
    },
    {
      title: "Extensive Menu Options with Consistent Taste",
      body: "Variety with high standard quality.",
    },
    {
      title: "Planned Quantities",
      body: "Tell us your guest count and we will suggest portions so nothing runs short and little goes to waste.",
    },
    {
      title: "Catering for Every Celebration",
      body: "Weddings, religious functions, festivals, corporate events or other occasions.",
    },
  ],
} as const;

export type FlagshipOutlet = {
  id: string;
  name: string;
  city: string;
  address: string;
  hours?: string;
  phone: string;
  mapUrl: string;
  type: "flagship" | "kitchen" | "popup";
};

function mapsSearchUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export const flagshipOutlets: FlagshipOutlet[] = [
  {
    id: "aerodrome-circle",
    name: "Aerodrome Circle (Flagship)",
    city: "Kota, Rajasthan",
    address: "Aerodrome Circle, Jhalawar Road, Gumanpura, Kota, Rajasthan 324006",
    phone: "8306084988",
    mapUrl: mapsSearchUrl(
      "Aerodrome Circle, Jhalawar Road, Gumanpura, Kota, Rajasthan 324006",
    ),
    type: "flagship",
  },
  {
    id: "rangbari",
    name: "Rangbari",
    city: "Kota, Rajasthan",
    address:
      "Shop No. 4, Main Rd, opposite LIC Building, Veer Sawarkar Nagar, Rangbari, Kota, Rajasthan 324005",
    phone: "9828806788",
    mapUrl: mapsSearchUrl(
      "Shop No. 4, Main Rd, opposite LIC Building, Veer Sawarkar Nagar, Rangbari, Kota, Rajasthan 324005",
    ),
    type: "kitchen",
  },
  {
    id: "bundi-road",
    name: "Bundi Road",
    city: "Kota, Rajasthan",
    address: "Bundi Road, Kota, Rajasthan",
    phone: "8306084988",
    mapUrl: mapsSearchUrl("Bundi Road, Kota, Rajasthan"),
    type: "kitchen",
  },
];

export const outletsPage = {
  metaTitle: "Our Outlets in Kota",
  metaDescription:
    "Visit Jai Jinendra Sweets & Namkeens outlets in Kota — Aerodrome Circle flagship, Rangbari, and Bundi Road.",
  eyebrow: "Visit Us",
  title: "Our Outlets in Kota",
  intro:
    "Visit our Kota outlets for fresh kadhai batches, Kota Kachoris, namkeens, sweets, and gifting. Corporate gifting and pan-India orders remain available year-round online.",
  outlets: flagshipOutlets,
} as const;
