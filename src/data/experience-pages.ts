import images from "@/data/image-map.json";
import type { CategoryId } from "@/types/catalog";

export type ExperienceSlide = {
  id: string;
  src: string;
  alt: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export type ExperiencePageConfig = {
  slug: string;
  stitchTitle: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  eyebrow: string;
  intro: string;
  category: CategoryId | "combos";
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  highlights: { title: string; body: string }[];
  slides: ExperienceSlide[];
};

export const sweetsPage: ExperiencePageConfig = {
  slug: "sweets",
  stitchTitle: "Jai Jinendra Namkeens - Sweets & Traditional Mithai",
  metaTitle: "Sweets & Traditional Mithai",
  metaDescription:
    "Shop pure ghee mithai — Silver Vark Kaju Katli, Motichoor Laddu, Pista Gulab Jamun, and royal festive sweets from Jai Jinendra Namkeens.",
  h1: "Sweets & Traditional Mithai",
  eyebrow: "Heritage Halwai Kitchen • Pure Cow Ghee",
  intro:
    "Slow-simmered in bilona cow ghee and finished by hand — our mithai collection carries the same royal sweetness that has celebrated weddings, Diwali, and family tables since 1982.",
  category: "mithai",
  primaryCta: { label: "Shop All Mithai", href: "#mithai-grid" },
  secondaryCta: { label: "Build a Sweet Combo", href: "/combos" },
  highlights: [
    {
      title: "100% Pure Cow Ghee",
      body: "Every laddu, katli, and jamun is slow-cooked in fragrant bilona ghee — never vanaspati.",
    },
    {
      title: "Festive Ready Packs",
      body: "Gift-ready tins and trays sized for Diwali trays, wedding favours, and temple offerings.",
    },
    {
      title: "Same-Day Kitchen Fresh",
      body: "Batches leave our mithai kitchen within hours, packed for cool, careful pan-India transit.",
    },
  ],
  slides: [
    {
      id: "kaju-katli",
      src: images.bannerSweetsKatli,
      alt: "Indulge in Royal Mithai - Pure Cow Ghee Sweets - Kaju Katli, Motichoor, Gulab Jamun - Jai Jinendra Namkeens",
    },
    {
      id: "motichoor",
      src: images.bannerSweetsLaddu,
      alt: "Halwai Favourites - Motichoor Laddu, Pista Gulab Jamun, Kesar Peda - Jai Jinendra Namkeens",
    },
  ],
};

export const kachorisPage: ExperiencePageConfig = {
  slug: "kachoris",
  stitchTitle: "Jai Jinendra Namkeens - Kachori & Hot Snacks",
  metaTitle: "Kachori & Hot Snacks",
  metaDescription:
    "Order freshly fried Jodhpur Khasta Dal Kachori, hot snacks, and ready-to-reheat festive staples from Jai Jinendra Namkeens.",
  h1: "Kachori & Hot Snacks",
  eyebrow: "Fresh Batch Today • Ready to Reheat",
  intro:
    "Multilayer desi-ghee dough, slow-roasted moong dal, and Hathras hing — our khasta kachoris and hot snacks arrive kitchen-fresh, ready for chai, thalis, and festive spreads.",
  category: "kachoris",
  primaryCta: { label: "Shop Hot Snacks", href: "#kachori-grid" },
  secondaryCta: { label: "Pair with Namkeens", href: "/catalogue/namkeens" },
  highlights: [
    {
      title: "Flaky Khasta Shells",
      body: "Hand-rolled multilayer dough fried to a shatter-crisp finish in pure ghee.",
    },
    {
      title: "Freeze & Reheat",
      body: "Packs stay crisp after gentle oven or air-fryer reheating — party-ready in minutes.",
    },
    {
      title: "Jain Friendly Fillings",
      body: "No onion, no garlic — hing, coriander, and saunf for authentic Rajasthani heat.",
    },
  ],
  slides: [
    {
      id: "dal-kachori",
      src: images.bannerKachoriKhasta,
      alt: "Khasta Dal Kachori - Fresh from the Kadhai - Jai Jinendra Namkeens",
    },
    {
      id: "snacks-banner",
      src: images.bannerKachoriSnacks,
      alt: "Chai-Time Hot Snacks - Kachori, Mathri, Sev - Jai Jinendra Namkeens",
    },
  ],
};

export const hampersPage: ExperiencePageConfig = {
  slug: "hampers",
  stitchTitle: "Jai Jinendra Namkeens - Gift Hampers & Festive Keepsakes",
  metaTitle: "Gift Hampers & Festive Keepsakes",
  metaDescription:
    "Curate luxury gift hampers, embossed tins, and festive keepsakes with sweets, namkeens, and dry fruits from Jai Jinendra Namkeens.",
  h1: "Gift Hampers & Festive Keepsakes",
  eyebrow: "Diwali • Weddings • Corporate Gifting",
  intro:
    "Embossed tins, silk-ribbon trunks, and bespoke brass-sealed hampers — curated assortments of mithai, namkeens, and dry fruits for the celebrations that matter.",
  category: "gifts",
  primaryCta: { label: "Browse Hampers", href: "#hamper-grid" },
  secondaryCta: { label: "Build a Custom Combo", href: "/combos" },
  highlights: [
    {
      title: "Keepsake Packaging",
      body: "Gold-embossed tins and wooden trunks designed to be reused long after the sweets are gone.",
    },
    {
      title: "Multi-Address Dispatch",
      body: "Send corporate and wedding hampers to guests across 26,000+ pin codes in one order.",
    },
    {
      title: "Personal Wax Seals",
      body: "Optional greeting cards and brass seals for brand marks or family monograms.",
    },
  ],
  slides: [
    {
      id: "heritage-box",
      src: images.bannerHamperHeritage,
      alt: "Gift Hampers & Keepsakes - Diwali, Weddings, Corporate - Jai Jinendra Namkeens",
    },
    {
      id: "aristocrat",
      src: images.bannerHamperTrunk,
      alt: "The Aristocrat Trunk - Luxury Mithai & Namkeen Gifts - Jai Jinendra Namkeens",
    },
  ],
};

export const combosPage: ExperiencePageConfig = {
  slug: "combos",
  stitchTitle: "Jai Jinendra Namkeens - Custom Combo Builder",
  metaTitle: "Custom Combo Builder",
  metaDescription:
    "Build a custom chai-nashta combo or festive tasting box — mix namkeens, mithai, and kachoris with instant price totals from Jai Jinendra Namkeens.",
  h1: "Custom Combo Builder",
  eyebrow: "Compose Your Own Tasting Box",
  intro:
    "Pick your favourites across savories, sweets, and hot snacks. Watch the embossed gift tray fill and the price reconcile instantly — then add your bespoke combo to cart.",
  category: "combos",
  primaryCta: { label: "Start Building", href: "#combo-builder" },
  secondaryCta: { label: "Browse Ready Combos", href: "#ready-combos" },
  highlights: [
    {
      title: "Mix Sweet & Savory",
      body: "Balance Ratlami sev with kaju katli, or stack kachoris beside mathri for chai hour.",
    },
    {
      title: "Live Price Tray",
      body: "Quantity steppers update gram weights and totals as you curate — no surprises at checkout.",
    },
    {
      title: "Gift-Ready Finish",
      body: "Combos ship in nitrogen-sealed pouches nested inside an embossed presentation tray.",
    },
  ],
  slides: [
    {
      id: "chai-bundle",
      src: images.bannerComboBuilder,
      alt: "Build Your Combo Pack - Mix Sweet + Savory - Jai Jinendra Namkeens",
    },
    {
      id: "savory",
      src: images.bannerComboChai,
      alt: "Chai-Nashta Combo - Everyday Rituals, Gift-Ready - Jai Jinendra Namkeens",
    },
  ],
};

export const experiencePages = [sweetsPage, kachorisPage, hampersPage, combosPage] as const;

/** SKUs available in the interactive combo builder tray */
export { comboBuilderPoolIds } from "@/data/combo-builder";
