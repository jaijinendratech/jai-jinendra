import images from "@/data/image-map.json";
import type {
  CatalogueFilterOption,
  CataloguePill,
  PriceRangeOption,
  Product,
} from "@/types/catalog";

export const catalogueMeta = {
  title: "Our Complete Artisanal Catalogue",
  mobileTitle: "Shop the Catalogue",
  eyebrow: "100% Shuddh Shakahari • Generational Artisanal Kitchens",
  mobileEyebrow: "100% Pure Veg · Fresh Daily",
  description:
    "Over 60+ authentic recipes handcrafted daily in pure desi ghee, cold-pressed oils, and freshly ground spices. Vacuum nitrogen-sealed immediately upon batch frying for guaranteed pan-India doorstep crispness.",
  mobileDescription:
    "60+ recipes in pure ghee & cold-pressed oils — nitrogen-sealed for pan-India crispness.",
  totalCount: 64,
  freshnessNote: "Fresh Batches Packaged 3 Hours Ago",
  freshnessNoteMobile: "Packed fresh today",
  giftBanner: {
    eyebrow: "Corporate & Bespoke Weddings",
    title: "Artisanal Gifting Hampers & Custom Embossed Tins",
    mobileTitle: "Gift Hampers & Custom Tins",
    body: "Custom brass finish tins, personalized royal wax seal greeting cards, and multi-address pan-India delivery for festive celebrations.",
    mobileBody: "Custom tins, wax seals & multi-city delivery.",
    cta: { label: "Enquire Corporate Gifting", href: "/hampers", mobileLabel: "Enquire Gifting" },
    note: "Over 500+ corporate clients served",
    image: images.catalogueGift,
    imageAlt:
      "Luxury handcrafted Indian royal gift hamper box with pure desi ghee sweets and dry fruit namkeens",
  },
  warranty: {
    title: "100% Crispness Warranty",
    body: "If your namkeens do not arrive perfectly crisp, we ship an immediate fresh replacement. Zero questions asked.",
  },
  qualityPillars: [
    {
      id: "oils",
      title: "Cold-Pressed Oils",
      body: "Strictly slow wood-pressed groundnut & mustard oils. 0% Palm oil forever.",
      mobileBody: "Wood-pressed oils. 0% palm oil.",
    },
    {
      id: "ghee",
      title: "100% Pure Cow Ghee",
      body: "Our sweets are slow-simmered in golden bilona cow ghee for unmatched aroma.",
      mobileBody: "Slow-simmered in bilona cow ghee.",
    },
    {
      id: "nitrogen",
      title: "Nitrogen Fresh Seal",
      body: "Every pouch is flushed within minutes of frying to lock in kitchen-fresh crunch.",
      mobileBody: "Flushed minutes after frying.",
    },
    {
      id: "dispatch",
      title: "24-Hour Dispatch",
      body: "Orders leave our kitchen within a day to 26,000+ pin codes across India.",
      mobileBody: "Out for India within 24 hrs.",
    },
  ],
} as const;

export const cataloguePills: CataloguePill[] = [
  { id: "all", label: "All Products", mobileLabel: "All", count: 64, icon: "menu" },
  { id: "namkeens", label: "Crispy Namkeens", mobileLabel: "Namkeens", count: 22, icon: "bakery" },
  { id: "kachoris", label: "Khasta Kachori & Samosa", mobileLabel: "Kachoris", count: 8, icon: "lunch" },
  { id: "mithai", label: "Heritage Mithai", mobileLabel: "Mithai", count: 14, icon: "cookie" },
  { id: "gifts", label: "Luxury Hampers & Tins", mobileLabel: "Hampers", count: 12, icon: "gift" },
  { id: "combos", label: "Tea-Time Combos", mobileLabel: "Combos", count: 8, icon: "cafe" },
];

export const specialtyFilters: CatalogueFilterOption[] = [
  { id: "namkeens", label: "Namkeens & Bhujia", count: 22 },
  { id: "kachoris", label: "Khasta Kachori & Samosa", count: 8 },
  { id: "mithai", label: "Pure Ghee Sweets", count: 14 },
  { id: "dry-fruits", label: "Dry Fruit Namkeens", count: 9 },
  { id: "gifts", label: "Festive Gifting Hampers", count: 11 },
];

export const purityFilters: CatalogueFilterOption[] = [
  { id: "pure-veg", label: "100% Shuddh Pure Veg" },
  { id: "cow-ghee", label: "Made in 100% Pure Cow Ghee" },
  { id: "no-palm", label: "Zero Palm Oil (Cold-Pressed)" },
  { id: "jain", label: "Jain Friendly (No Onion/Garlic)" },
];

export const spiceFilters: CatalogueFilterOption[] = [
  { id: "mild", label: "Mild & Mellow" },
  { id: "medium", label: "Medium Zesty" },
  { id: "teekha", label: "Teekha / Hing" },
  { id: "chatpata", label: "Chatpata Tangy" },
];

export const priceRanges: PriceRangeOption[] = [
  { id: "under-250", label: "Under ₹250", min: 0, max: 249 },
  { id: "250-500", label: "₹250 – ₹500", min: 250, max: 500 },
  { id: "500-1000", label: "₹500 – ₹1000", min: 500, max: 1000 },
  { id: "1000-plus", label: "₹1000+", min: 1000, max: 100000 },
];

export const sortOptions = [
  { id: "featured", label: "Featured Artisanal Picks" },
  { id: "bestsellers", label: "Bestsellers (Most Loved)" },
  { id: "fresh", label: "Fresh Batches Today" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Customer Rating (4.8+)" },
] as const;

export const catalogueProducts: Product[] = [
  {
    id: "shahi-kaju-mixture",
    name: "Shahi Kaju Mixture",
    slug: "shahi-kaju-mixture",
    description:
      "Plump Goan cashews, raisins, and roasted melon seeds blended with crisp hand-spun gram sev.",
    longDescription:
      "Our signature dry-fruit savory is roasted in small batches with cold-pressed groundnut oil. Whole Goan cashews, green raisins, and melon seeds are folded into hand-spun gram sev for a royal tea-time crunch.",
    image: images.prod0,
    imageAlt: "Shahi Kaju Mixture with cashews, raisins, and potato salli",
    price: 299,
    originalPrice: 349,
    discountLabel: "-14%",
    badge: "Bestseller",
    tagline: "Dry Fruit Savory",
    rating: 4.9,
    reviewCount: 1240,
    category: "namkeens",
    spiceNote: "medium",
    dietary: ["pure-veg", "no-palm", "jain"],
    ingredients: ["Cashews", "Raisins", "Gram flour sev", "Melon seeds", "Cold-pressed oil"],
    shelfLife: "90 days nitrogen sealed",
    origin: "Rajasthan",
    variants: [
      { id: "400g", label: "400g", price: 299 },
      { id: "800g", label: "800g", price: 549 },
    ],
  },
  {
    id: "ratlami-sev-hing-bhujia",
    name: "Ratlami Sev & Hing Bhujia",
    slug: "ratlami-sev-hing-bhujia",
    description:
      "Pounded Laung (cloves) and compound Hing from Hathras create our signature tingling crunch.",
    longDescription:
      "A classic Ratlami recipe pounded with clove, black pepper, and Hathras hing. Fine sev and bhujia strands are fried fresh and nitrogen-sealed for pan-India crispness.",
    image: images.prod3,
    imageAlt: "Ratlami Sev and Hing Bhujia poured into a brass bowl",
    price: 195,
    originalPrice: 220,
    badge: "Strong Hing",
    tagline: "Signature Sev",
    rating: 4.8,
    reviewCount: 890,
    category: "namkeens",
    spiceNote: "teekha",
    dietary: ["pure-veg", "no-palm", "jain"],
    ingredients: ["Gram flour", "Hathras hing", "Cloves", "Black pepper", "Cold-pressed oil"],
    shelfLife: "90 days nitrogen sealed",
    origin: "Ratlam tradition",
    variants: [
      { id: "250g", label: "250g", price: 195 },
      { id: "500g", label: "500g", price: 360 },
      { id: "1kg", label: "1kg", price: 680 },
    ],
  },
  {
    id: "jodhpur-khasta-dal-kachori",
    name: "Jodhpur Khasta Dal Kachori",
    slug: "jodhpur-khasta-dal-kachori",
    description:
      "Slow-roasted moong dal, crushed coriander and saunf encased in multilayer flaky desi ghee dough.",
    longDescription:
      "Hand-rolled khasta shells filled with slow-roasted yellow moong dal, coriander, and saunf. Ready to reheat for tea-time or festive thalis.",
    image: images.prod1,
    imageAlt: "Stack of golden Jodhpur Khasta Dal Kachoris on terracotta",
    price: 240,
    badge: "Fresh Batch Today",
    tagline: "Hot Snack Staple",
    rating: 4.9,
    reviewCount: 2110,
    category: "kachoris",
    spiceNote: "medium",
    dietary: ["pure-veg", "cow-ghee", "jain"],
    ingredients: ["Moong dal", "Desi ghee dough", "Coriander", "Saunf", "Hing"],
    shelfLife: "7 days refrigerated / freeze up to 30 days",
    origin: "Jodhpur",
    ctaNote: "Ready to Bake / Reheat",
    variants: [
      { id: "6", label: "Pack of 6", price: 240 },
      { id: "12", label: "Pack of 12", price: 450 },
    ],
  },
  {
    id: "pyaz-free-hing-kachori",
    name: "Pyaz-Free Hing Kachori",
    slug: "pyaz-free-hing-kachori",
    description:
      "Jain-friendly khasta shells stuffed with roasted dal, crushed pepper, and digestive Hathras hing.",
    longDescription:
      "A temple-friendly kachori without onion or garlic — hing-forward filling wrapped in multilayer desi-ghee dough, ideal for fasting days and everyday chai.",
    image: images.cat1,
    imageAlt: "Golden hing kachoris with green chutney on a brass plate",
    price: 220,
    badge: "Jain Friendly",
    tagline: "Hot Snack Staple",
    rating: 4.8,
    reviewCount: 640,
    category: "kachoris",
    spiceNote: "teekha",
    dietary: ["pure-veg", "cow-ghee", "jain"],
    ingredients: ["Moong dal", "Hathras hing", "Black pepper", "Desi ghee dough"],
    shelfLife: "7 days refrigerated / freeze up to 30 days",
    origin: "Rajasthan",
    ctaNote: "Ready to Bake / Reheat",
    variants: [
      { id: "6", label: "Pack of 6", price: 220 },
      { id: "12", label: "Pack of 12", price: 410 },
    ],
  },
  {
    id: "mini-party-samosa-pack",
    name: "Mini Party Samosa Pack",
    slug: "mini-party-samosa-pack",
    description:
      "Bite-size flaky samosas filled with spiced potato and peas — oven-ready for festive platters.",
    longDescription:
      "Cocktail-size samosas with a crisp pastry shell and classic spiced filling. Arrive frozen-ready for quick oven finishing before guests arrive.",
    image: images.prod1,
    imageAlt: "Mini golden samosas stacked for a party platter",
    price: 280,
    badge: "Party Pack",
    tagline: "Hot Snack Staple",
    rating: 4.7,
    reviewCount: 410,
    category: "kachoris",
    spiceNote: "medium",
    dietary: ["pure-veg", "no-palm"],
    ingredients: ["Wheat pastry", "Potato", "Green peas", "Garam masala"],
    shelfLife: "Freeze up to 45 days",
    origin: "Festive kitchen",
    ctaNote: "Ready to Bake / Reheat",
    variants: [
      { id: "12", label: "Pack of 12", price: 280 },
      { id: "24", label: "Pack of 24", price: 520 },
    ],
  },
  {
    id: "silver-vark-kaju-katli",
    name: "Silver Vark Kaju Katli",
    slug: "silver-vark-kaju-katli",
    description:
      "100% whole grade Goan cashews hand-kneaded without essence or excess sugar. Melts on tongue.",
    longDescription:
      "Stone-ground Goan cashews kneaded with just enough sugar and finished with certified vegetarian silver vark. A royal mithai staple for gifting and celebrations.",
    image: images.prod2,
    imageAlt: "Silver Vark Kaju Katli diamonds in a velvet gift box",
    price: 550,
    originalPrice: 599,
    badge: "Royal Mithai",
    tagline: "Pure Cashew Sweet",
    rating: 5.0,
    reviewCount: 3450,
    category: "mithai",
    spiceNote: "mild",
    dietary: ["pure-veg", "cow-ghee", "jain"],
    ingredients: ["Goan cashews", "Sugar", "Certified veg silver vark", "Cardamom"],
    shelfLife: "15 days cool & dry",
    origin: "Rajasthan mithai kitchen",
    variants: [
      { id: "250g", label: "250g", price: 550 },
      { id: "500g", label: "500g", price: 1050 },
      { id: "1kg", label: "1kg", price: 1990 },
    ],
  },
  {
    id: "bikaneri-bhujia-extra-crisp",
    name: "Bikaneri Bhujia Extra Crisp",
    slug: "bikaneri-bhujia-extra-crisp",
    description:
      "Originating from desert stone mills, authentic moth bean flour and freshly crushed spices.",
    longDescription:
      "Fine moth-dal bhujia strands fried to an extra-crisp finish with black pepper and green cardamom — the everyday Bikaneri classic.",
    image: images.prod4,
    imageAlt: "Golden Bikaneri bhujia strands in an engraved brass bowl",
    price: 180,
    badge: "Moth Dal Recipe",
    tagline: "Heritage Classic",
    rating: 4.8,
    reviewCount: 920,
    category: "namkeens",
    spiceNote: "medium",
    dietary: ["pure-veg", "no-palm", "jain"],
    ingredients: ["Moth dal flour", "Black pepper", "Cardamom", "Cold-pressed oil"],
    shelfLife: "90 days nitrogen sealed",
    origin: "Bikaner tradition",
    variants: [
      { id: "400g", label: "400g", price: 180 },
      { id: "1kg", label: "1kg", price: 420 },
    ],
  },
  {
    id: "mathania-mirch-khakhra",
    name: "Mathania Mirch Khakhra & Farsan",
    slug: "mathania-mirch-khakhra",
    description:
      "Slow hand-pressed whole wheat crisps infused with sweet pungent Mathania chillies.",
    longDescription:
      "Paper-thin whole wheat khakhras pressed by hand and roasted with Mathania chilli flakes and cumin — light, spicy, and tea-ready.",
    image: images.prod5,
    imageAlt: "Stacked Mathania mirch wheat khakhra wafers with cumin seeds",
    price: 320,
    badge: "Vacuum Sealed",
    tagline: "Roasted Crisps",
    rating: 4.7,
    reviewCount: 540,
    category: "tea-time",
    spiceNote: "chatpata",
    dietary: ["pure-veg", "no-palm", "jain"],
    ingredients: ["Whole wheat", "Mathania chilli", "Cumin", "Rock salt"],
    shelfLife: "60 days vacuum sealed",
    origin: "Rajasthan",
    variants: [
      { id: "4", label: "Box of 4", price: 320 },
      { id: "8", label: "Box of 8", price: 580 },
    ],
  },
  {
    id: "royal-rajasthan-heritage-box",
    name: "Royal Rajasthan Heritage Box",
    slug: "royal-rajasthan-heritage-box",
    description:
      "Assortment of 4 gold-embossed tins: Shahi Mixture, Ratlami Sev, Ajwaini Mathri & Kaju Katli.",
    longDescription:
      "A curated festive hamper with four gold-embossed tins spanning savory classics and royal mithai — ideal for Diwali, weddings, and corporate gifting.",
    image: images.sig0,
    imageAlt: "Royal Rajasthan Heritage gift box with bhujia, mathri, and ghevar",
    price: 890,
    originalPrice: 999,
    badge: "Festive Edition",
    tagline: "Curated Hamper",
    rating: 4.9,
    reviewCount: 780,
    category: "gifts",
    spiceNote: "medium",
    dietary: ["pure-veg", "cow-ghee", "jain"],
    ingredients: ["Shahi Mixture", "Ratlami Sev", "Ajwaini Mathri", "Kaju Katli"],
    shelfLife: "See individual tin labels",
    origin: "Festive curation desk",
    variants: [{ id: "box", label: "Gift Box", price: 890 }],
  },
  {
    id: "pista-gulab-jamun",
    name: "Pista Gulab Jamun in Desi Ghee",
    slug: "pista-gulab-jamun",
    description:
      "Khoya dumplings gently simmered in cow ghee, bathed in fragrant green cardamom and saffron syrup.",
    longDescription:
      "Soft khoya gulab jamuns fried in pure cow ghee and steeped in saffron-cardamom syrup, finished with pistachio slivers.",
    image: images.prod6,
    imageAlt: "Gulab jamun in saffron syrup garnished with pistachios",
    price: 480,
    badge: "100% Cow Ghee",
    tagline: "Traditional Sweets",
    rating: 4.9,
    reviewCount: 1560,
    category: "mithai",
    spiceNote: "mild",
    dietary: ["pure-veg", "cow-ghee"],
    ingredients: ["Khoya", "Pure cow ghee", "Saffron", "Cardamom", "Pistachio"],
    shelfLife: "7 days refrigerated",
    origin: "Halwai kitchen",
    ctaNote: "/ 1kg Tin",
    variants: [{ id: "1kg", label: "1kg Tin", price: 480 }],
  },
  {
    id: "hing-chana-badam-crunch",
    name: "Hing Chana & Roasted Badam Crunch",
    slug: "hing-chana-badam-crunch",
    description:
      "Slow dry-roasted whole chana and California almonds dusted with digestive Hathras asafoetida.",
    longDescription:
      "Protein-rich black chickpeas and California almonds dry-roasted and dusted with digestive hing and rock salt.",
    image: images.prod7,
    imageAlt: "Roasted chana and almonds with hing seasoning",
    price: 360,
    badge: "Protein Rich",
    tagline: "Healthy Crunch",
    rating: 4.6,
    reviewCount: 340,
    category: "dry-fruits",
    spiceNote: "teekha",
    dietary: ["pure-veg", "no-palm", "jain"],
    ingredients: ["Black chana", "Almonds", "Hathras hing", "Rock salt"],
    shelfLife: "90 days",
    origin: "Dry fruit atelier",
    ctaNote: "/ 400g",
    variants: [{ id: "400g", label: "400g", price: 360 }],
  },
  {
    id: "ajwaini-mathri-nimki",
    name: "Ajwaini Mathri & Crispy Nimki",
    slug: "ajwaini-mathri-nimki",
    description:
      "Golden flaky savory biscuits infused with fragrant ajwain seeds. The eternal evening companion.",
    longDescription:
      "Flaky ajwain mathri and crispy nimki fried fresh for chai o'clock — aromatic, light, and endlessly snackable.",
    image: images.prod8,
    imageAlt: "Ajwaini mathri crackers stacked beside masala chai",
    price: 190,
    tagline: "Chai-Time Staple",
    rating: 4.8,
    reviewCount: 610,
    category: "tea-time",
    spiceNote: "mild",
    dietary: ["pure-veg", "no-palm", "jain"],
    ingredients: ["Wheat flour", "Ajwain", "Black pepper", "Cold-pressed oil"],
    shelfLife: "45 days",
    origin: "Rajasthan",
    ctaNote: "/ 400g",
    variants: [{ id: "400g", label: "400g", price: 190 }],
  },
  {
    id: "besan-motichoor-laddu",
    name: "Besan Motichoor Laddu",
    slug: "besan-motichoor-laddu",
    description:
      "Tiny chickpea pearls slow fried in fragrant desi ghee, blended with saffron sugar syrup.",
    longDescription:
      "Melt-in-mouth motichoor pearls fried in fragrant desi ghee, bound with Kashmiri saffron syrup and melon seeds.",
    image: images.prod9,
    imageAlt: "Motichoor laddus garnished with gold leaf in a gift box",
    price: 420,
    badge: "Kashmiri Saffron",
    tagline: "Pure Ghee Mithai",
    rating: 4.9,
    reviewCount: 1940,
    category: "mithai",
    spiceNote: "mild",
    dietary: ["pure-veg", "cow-ghee"],
    ingredients: ["Besan", "Desi ghee", "Kashmiri saffron", "Melon seeds"],
    shelfLife: "10 days cool & dry",
    origin: "Halwai kitchen",
    ctaNote: "/ 500g",
    variants: [{ id: "500g", label: "500g", price: 420 }],
  },
  {
    id: "aristocrat-mithai-trunk",
    name: "The Aristocrat Mithai Trunk",
    slug: "aristocrat-mithai-trunk",
    description:
      "Bespoke keepsake trunk with 6 assorted luxury confections, pistachios, and saffron almonds.",
    longDescription:
      "A grand wooden trunk filled with six luxury confections, pistachio barfi, roasted dry fruits, and festive brass accents — our top-tier gift.",
    image: images.sig1,
    imageAlt: "Aristocrat Mithai Trunk with kaju katli and kesar peda",
    price: 1450,
    badge: "Luxury Gift Trunk",
    tagline: "Handmade Trunk",
    rating: 5.0,
    reviewCount: 220,
    category: "gifts",
    spiceNote: "mild",
    dietary: ["pure-veg", "cow-ghee"],
    ingredients: ["Assorted mithai", "Pistachios", "Saffron almonds"],
    shelfLife: "See trunk insert",
    origin: "Luxury gifting atelier",
    variants: [{ id: "trunk", label: "Keepsake Trunk", price: 1450 }],
  },
  {
    id: "diwali-corporate-tin-set",
    name: "Diwali Corporate Tin Set",
    slug: "diwali-corporate-tin-set",
    description:
      "Three embossed tins — Ratlami Sev, Kaju Katli, and Ajwaini Mathri — ready for multi-address corporate dispatch.",
    longDescription:
      "A scalable corporate gifting set with brass-finish embossed tins, optional wax-seal cards, and vacuum-sealed contents chosen for travel-safe freshness.",
    image: images.catalogueGift,
    imageAlt: "Set of three embossed festive gift tins with sweets and namkeens",
    price: 1190,
    originalPrice: 1350,
    discountLabel: "-12%",
    badge: "Corporate Favourite",
    tagline: "Festive Keepsake",
    rating: 4.9,
    reviewCount: 360,
    category: "gifts",
    spiceNote: "medium",
    dietary: ["pure-veg", "cow-ghee", "jain"],
    ingredients: ["Ratlami Sev", "Kaju Katli", "Ajwaini Mathri"],
    shelfLife: "See individual tin labels",
    origin: "Corporate gifting desk",
    variants: [
      { id: "set", label: "3-Tin Set", price: 1190 },
      { id: "bulk", label: "Case of 12", price: 12990 },
    ],
  },
];

export function getProductBySlug(slug: string) {
  return catalogueProducts.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: string) {
  if (category === "all") return catalogueProducts;
  if (category === "combos") {
    return catalogueProducts.filter(
      (product) => product.category === "tea-time" || product.category === "combos",
    );
  }
  return catalogueProducts.filter((product) => product.category === category);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return catalogueProducts
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, limit);
}
