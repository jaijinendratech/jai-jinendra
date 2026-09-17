import images from "@/data/image-map.json";
import type { ExperienceSlide } from "@/data/experience-pages";
import type { CategoryId } from "@/types/catalog";

export type ComboBoxSize = {
  id: string;
  name: string;
  description: string;
  capacityLabel: string;
  basePrice: number;
  slots: number;
};

export type ComboBuilderStep = {
  id: number;
  label: string;
  title: string;
  status: "completed" | "active" | "pending";
};

export type ComboFilterId = "all" | "namkeens" | "mithai" | "kachoris";

export type ComboFilter = {
  id: ComboFilterId;
  label: string;
  categories: CategoryId[] | "all";
};

export const comboBuilderMeta = {
  stitchTitle: "Build Your Custom Combo Box | Jai Jinendra Namkeens",
  metaTitle: "Build Your Custom Combo Box",
  metaDescription:
    "Curate your personalized mix of freshly fried namkeens, authentic mithai, and teatime snacks in a premium gift box from Jai Jinendra Namkeens.",
  heroTitle: "Create Your Custom Heritage Box",
  comboDiscountRate: 0.15,
  freeShippingSlotThreshold: 4,
} as const;

export const comboBuilderHeroSlides: ExperienceSlide[] = [
  {
    id: "heritage-box",
    src: images.sig0,
    alt: "Luxurious Indian festive gift hamper with brass platters of namkeens and mithai",
    eyebrow: "Bespoke Festive Gifting",
    title: "Create Your Custom Heritage Box",
    subtitle:
      "Mix freshly fried namkeens, pure ghee mithai, and teatime snacks in one premium gift box.",
  },
  {
    id: "savory-tray",
    src: images.hero1,
    alt: "Premium Indian namkeens and snacks arranged in elegant brass bowls",
    eyebrow: "Savory First",
    title: "Bhujia, Sev & Mathri",
    subtitle: "Build a crunch-forward tray sealed the same day for lasting crispness.",
  },
  {
    id: "sweet-savory",
    src: images.sig2,
    alt: "Chai-nashta snack hamper with kraft canisters of sweets and savories",
    eyebrow: "Family Bundle",
    title: "Compose a Chai-Nashta Box",
    subtitle: "Everyday rituals sorted — mix, match, and seal fresh from our Rajasthan kitchen.",
  },
  {
    id: "festive-mix",
    src: images.banner,
    alt: "Festive sweets and gift boxes arranged for celebration",
    eyebrow: "Festive Mixing",
    title: "Sweet + Savory Celebrations",
    subtitle: "Ideal for Diwali trays, hostess gifts, and thoughtful corporate hampers.",
  },
];

export const comboBoxSizes: ComboBoxSize[] = [
  {
    id: "brass-4",
    name: "4-Item Brass Trim Box",
    description: "Perfect for couples and mindful gifting.",
    capacityLabel: "4 x 200g - 400g",
    basePrice: 350,
    slots: 4,
  },
  {
    id: "velvet-6",
    name: "6-Item Velvet Casket",
    description: "Opulent family treat with satin partitions.",
    capacityLabel: "6 Assorted Jars",
    basePrice: 550,
    slots: 6,
  },
  {
    id: "trunk-8",
    name: "8-Item Grand Trunk",
    description: "Embossed brass lock with heirloom tea tin.",
    capacityLabel: "8 Generous Packs",
    basePrice: 850,
    slots: 8,
  },
];

export const comboBuilderSteps: ComboBuilderStep[] = [
  {
    id: 1,
    label: "Step 1",
    title: "Select Box Size",
    status: "completed",
  },
  {
    id: 2,
    label: "Step 2 (Active)",
    title: "Select Namkeens & Sweets",
    status: "active",
  },
  {
    id: 3,
    label: "Step 3",
    title: "Review & Checkout",
    status: "pending",
  },
];

export const comboFilters: ComboFilter[] = [
  { id: "all", label: "All Treats", categories: "all" },
  { id: "namkeens", label: "Namkeens & Farsan", categories: ["namkeens", "tea-time", "dry-fruits"] },
  { id: "mithai", label: "Desi Ghee Mithai", categories: ["mithai"] },
  { id: "kachoris", label: "Kachoris & Khakhras", categories: ["kachoris"] },
];

export const comboBuilderPoolIds = [
  "ratlami-sev-hing-bhujia",
  "shahi-kaju-mixture",
  "silver-vark-kaju-katli",
  "besan-motichoor-laddu",
  "mathania-mirch-khakhra",
  "pyaz-free-hing-kachori",
] as const;

export const comboBuilderDefaultQty: Record<string, number> = {
  "ratlami-sev-hing-bhujia": 1,
  "shahi-kaju-mixture": 1,
  "silver-vark-kaju-katli": 1,
};

export const comboTrustPillars = [
  {
    id: "nitrogen",
    title: "Nitrogen Sealed Freshness",
    body: "Locks in crunch and aromatic vapors without artificial preservatives.",
    icon: "air" as const,
  },
  {
    id: "veg",
    title: "100% Shuddh Vegetarian",
    body: "Strict Jain preparation principles, prepared in sacred dedicated kitchens.",
    icon: "leaf" as const,
  },
  {
    id: "dispatch",
    title: "Air-Courier Dispatch",
    body: "Dispatched within 24 hours of frying via premium express carriers.",
    icon: "plane" as const,
  },
  {
    id: "heritage",
    title: "Heirloom Recipes",
    body: "Three generations of Marwari culinary mastery honed since 1968.",
    icon: "sparkles" as const,
  },
];

/** Display tag shown on combo item cards (Stitch copy) */
export const comboItemTags: Record<string, string> = {
  "ratlami-sev-hing-bhujia": "Spicy Clove Infusion",
  "shahi-kaju-mixture": "Dry Fruit Delight",
  "silver-vark-kaju-katli": "100% Shuddh Cashew",
  "besan-motichoor-laddu": "A2 Bilona Cow Ghee",
  "mathania-mirch-khakhra": "Vacuum Roasted",
  "pyaz-free-hing-kachori": "Crispy Teatime Classic",
};

/** Short display names for slot preview */
export const comboItemShortNames: Record<string, string> = {
  "ratlami-sev-hing-bhujia": "Ratlami Sev",
  "shahi-kaju-mixture": "Kaju Mix",
  "silver-vark-kaju-katli": "Kaju Katli",
  "besan-motichoor-laddu": "Besan Laddu",
  "mathania-mirch-khakhra": "Khakhra",
  "pyaz-free-hing-kachori": "Mini Kachori",
};
