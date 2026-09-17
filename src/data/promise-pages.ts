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
      year: "1982",
      title: "A Sacred Vow in Rajasthan",
      body: "Founded in the royal lanes of Rajasthan on uncompromised purity — cold-pressed oils, hand-pounded spices, and zero preservatives.",
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
    "Learn how Jai Jinendra Namkeens maintains 100% shuddh vegetarian kitchens, cold-pressed oils, lab-tested batches, and FSSAI certification.",
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
    "Corporate Diwali hampers, wedding favours, and multi-address festive gifting with branding, brass seals, and pan-India dispatch from Jai Jinendra Namkeens.",
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

export type FlagshipOutlet = {
  id: string;
  name: string;
  city: string;
  address: string;
  hours: string;
  phone: string;
  type: "flagship" | "kitchen" | "popup";
};

export const flagshipOutlets: FlagshipOutlet[] = [
  {
    id: "jodhpur-heritage",
    name: "Jodhpur Heritage Kitchen Counter",
    city: "Jodhpur, Rajasthan",
    address: "Near Clock Tower Bazaar, Old City, Jodhpur 342001",
    hours: "Mon–Sun · 10:00 AM – 8:30 PM",
    phone: siteConfig.phone,
    type: "kitchen",
  },
  {
    id: "jaipur-flagship",
    name: "Jaipur Flagship Boutique",
    city: "Jaipur, Rajasthan",
    address: "MI Road Heritage Lane, Jaipur 302001",
    hours: "Mon–Sun · 11:00 AM – 9:00 PM",
    phone: siteConfig.phone,
    type: "flagship",
  },
  {
    id: "delhi-popup",
    name: "Delhi NCR Festive Pop-Up",
    city: "Gurugram, Delhi NCR",
    address: "Seasonal counter · Select malls during Diwali & wedding season",
    hours: "Festive calendar · Announced on Instagram",
    phone: siteConfig.phone,
    type: "popup",
  },
  {
    id: "mumbai-popup",
    name: "Mumbai Festive Pop-Up",
    city: "South Mumbai",
    address: "Seasonal counter · Partner festive markets (Oct–Nov)",
    hours: "Festive calendar · Announced on Instagram",
    phone: siteConfig.phone,
    type: "popup",
  },
];

export const outletsPage = {
  metaTitle: "Our Flagship Outlets",
  metaDescription:
    "Visit Jai Jinendra Namkeens flagship counters in Rajasthan and seasonal festive pop-ups across major metros.",
  eyebrow: "Visit Us",
  title: "Our Flagship Outlets",
  intro:
    "Taste fresh kadhai batches at our Rajasthan heritage counters, or find us at seasonal metro pop-ups during Diwali. Corporate gifting desk remains available year-round online.",
  outlets: flagshipOutlets,
} as const;
