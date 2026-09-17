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
      src: images.prod2,
      alt: "Silver Vark Kaju Katli diamonds arranged in a velvet gift box",
      eyebrow: "Royal Mithai",
      title: "Silver Vark Kaju Katli",
      subtitle: "Stone-ground Goan cashews. Melts on the tongue.",
    },
    {
      id: "motichoor",
      src: images.prod9,
      alt: "Besan Motichoor Laddus garnished with gold leaf",
      eyebrow: "Pure Ghee Classic",
      title: "Besan Motichoor Laddu",
      subtitle: "Kashmiri saffron pearls fried in fragrant desi ghee.",
    },
    {
      id: "gulab",
      src: images.prod6,
      alt: "Pista Gulab Jamun in saffron syrup",
      eyebrow: "Halwai Favourite",
      title: "Pista Gulab Jamun",
      subtitle: "Khoya dumplings bathed in cardamom-saffron syrup.",
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
      src: images.prod1,
      alt: "Stack of golden Jodhpur Khasta Dal Kachoris on terracotta",
      eyebrow: "Jodhpur Classic",
      title: "Khasta Dal Kachori",
      subtitle: "Slow-roasted moong dal in multilayer flaky shells.",
    },
    {
      id: "snacks-banner",
      src: images.hero1,
      alt: "Crisp savory Indian snacks in brass bowls with spices",
      eyebrow: "Hot Snack Staples",
      title: "Fresh from the Kadhai",
      subtitle: "Kachoris, mathri, and chai-time crunch — sealed the same day.",
    },
    {
      id: "category",
      src: images.cat1,
      alt: "Flaky golden dal kachori with coriander and tamarind chutneys",
      eyebrow: "Serve Hot",
      title: "Chutney-Ready Moments",
      subtitle: "Pair with imli and green chutney for the full street-thali ritual.",
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
      src: images.sig0,
      alt: "Royal Rajasthan Heritage gift box with bhujia, mathri, and ghevar",
      eyebrow: "Festive Edition",
      title: "Royal Rajasthan Heritage Box",
      subtitle: "Four gold-embossed tins spanning savory classics and mithai.",
    },
    {
      id: "aristocrat",
      src: images.sig1,
      alt: "Aristocrat Mithai Trunk with kaju katli and kesar peda",
      eyebrow: "Luxury Gift Trunk",
      title: "The Aristocrat Mithai Trunk",
      subtitle: "Six luxury confections in a handmade keepsake trunk.",
    },
    {
      id: "corporate",
      src: images.catalogueGift,
      alt: "Luxury handcrafted Indian royal gift hamper with sweets and namkeens",
      eyebrow: "Corporate & Weddings",
      title: "Bespoke Embossed Tins",
      subtitle: "Brass seals, wax cards, and pan-India multi-address delivery.",
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
      src: images.sig2,
      alt: "Chai-Nashta breakfast snack hamper in kraft canisters",
      eyebrow: "Family Bundle",
      title: "Compose a Chai-Nashta Box",
      subtitle: "Everyday rituals sorted — mix, match, and seal fresh.",
    },
    {
      id: "savory",
      src: images.hero1,
      alt: "Premium Indian namkeens and snacks in elegant brass bowls",
      eyebrow: "Savory First",
      title: "Bhujia, Sev & Mathri",
      subtitle: "Build a crunch-forward tray for office desks and road trips.",
    },
    {
      id: "festive-mix",
      src: images.banner,
      alt: "Festive sweets and gift boxes arranged for celebration",
      eyebrow: "Festive Mixing",
      title: "Sweet + Savory Keepsakes",
      subtitle: "Ideal for Diwali trays and hostess gifts.",
    },
  ],
};

export const experiencePages = [sweetsPage, kachorisPage, hampersPage, combosPage] as const;

/** SKUs available in the interactive combo builder tray */
export { comboBuilderPoolIds } from "@/data/combo-builder";
