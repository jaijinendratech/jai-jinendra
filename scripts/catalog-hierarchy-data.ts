/**
 * Source-of-truth catalogue (5 categories) as supplied by the client.
 * Columns: category | subcategory | name | 250GM | 500GM | 1KG | PACK | PC  (0 = not sold)
 */
export type HierarchyRow = [
  category: string,
  subcategory: string | null,
  name: string,
  p250: number,
  p500: number,
  p1kg: number,
  pack: number,
  pc: number,
];

const dry = (name: string, a: number): HierarchyRow => ["sweets", "dryfruit-sweets", name, a, a * 2, a * 4, 0, 0];
const win = (name: string, a: number): HierarchyRow => ["sweets", "winter-special", name, a, a * 2, a * 4, 0, 0];
const nk = (sub: string, name: string, a: number, pack = 0): HierarchyRow => ["namkeen", sub, name, a, a * 2, a * 4, pack, 0];
const cookie = (name: string, a: number): HierarchyRow => ["bakery", "dry-cakes-cookies", name, a, a * 2, a * 4, 0, 0];

export const HIERARCHY_ROWS: HierarchyRow[] = [
  // SWEETS / DRYFRUIT SWEETS
  dry("KAJU KATLI", 375), dry("SANGAM BARFI", 375),
  ...["KAJU PISTA ROLL", "KAJU JALEBI", "KAJU SAMOSA", "ANJEER CAKE", "DIAMOND CAKE", "KHAJUR PAAK", "ANJEER PAAK",
    "KAJU BITES", "KAJU CHOCO BITES", "KAJU MANGO BITES", "KAJU ORANGE BITES", "ROSE BITES", "KACHHA AAM DELIGHT BITES",
    "CRANBERRY CRUNCH", "OREO CRUNCH", "PINEAPPLE CRUNCH", "MANGO CRUNCH", "MIXED FRUIT CRUNCH", "KESAR CRUNCH",
    "KIWI CRUNCH", "ORANGE CRUNCH", "STRAWBERRY CRUNCH"].map((n) => dry(n, 420)),
  dry("KIWI DELIGHT", 375), dry("MANGO DELIGHT", 375), dry("STRAWBERRY DELIGHT", 375),
  // SWEETS / WINTER SPECIAL
  win("MOONG GOND LADDU", 255), win("URAD GOND LADDU", 255), win("KHOPRA DRYFRUIT LADDU", 255),
  win("MAWA DRYFRUIT LADDU", 255), win("KHAJUR DRYFRUIT LADDU", 300),

  // NAMKEEN / SEV
  nk("sev", "RATLAMI SEV", 140), nk("sev", "LAUNG SEV", 140), nk("sev", "UJJAINI SEV", 140), nk("sev", "KADAK SEV", 140),
  nk("sev", "DOODH SEV", 140), nk("sev", "BARIK SEV", 130), nk("sev", "PODINA SEV", 140), nk("sev", "ZERO NO. SEV", 130),
  nk("sev", "TRIPLE LAUNG SEV", 150), nk("sev", "ALOO BHUJIYA", 150), nk("sev", "ALOO PINEAPPLE BHUJA", 150),
  nk("sev", "ALOO PALAK BHUJA", 150), nk("sev", "ALOO PODINA BHUJA", 150), nk("sev", "SPECIAL DRYFRUIT MIX", 300),
  // MIXTURE
  nk("mixture", "KHATTA MITHA MIX", 140), nk("mixture", "DALMOTH", 140),
  ["namkeen", "mixture", "CORNFLAKES MIX (200GM)", 0, 0, 560, 112, 0],
  nk("mixture", "KOTA MIX", 140), nk("mixture", "CHATPATA MIX", 140), nk("mixture", "MOONG MIX", 140),
  nk("mixture", "PUNJABI MIX", 140), nk("mixture", "RAJASTHANI MIX", 130), nk("mixture", "MADRASI MIX", 140),
  nk("mixture", "KAJU MIX", 220), nk("mixture", "DILLI MIX", 220),
  // TIMEPASS
  nk("timepass", "MOGAR DAL", 150), nk("timepass", "LAL CHANA", 145), nk("timepass", "TASTY", 140),
  nk("timepass", "CHANA MASALA DAL", 140), nk("timepass", "CHAPTA CHANA", 140), nk("timepass", "HEENG MOGAR", 165),
  nk("timepass", "HARA MOONG", 140), nk("timepass", "HARA CHANA", 140), nk("timepass", "DHANIYA DAL", 140),
  nk("timepass", "FIKI NUKTI", 130), nk("timepass", "CHARKI NUKTI", 130), nk("timepass", "FIKI PAPDI", 140),
  nk("timepass", "CHARKI PAPDI", 140),
  ["namkeen", "timepass", "DISCO PAPAD (200GM)", 0, 0, 560, 112, 0],
  // FALAHAARI
  ["namkeen", "falahaari", "ALU WAFERS (200)", 0, 0, 550, 110, 0],
  nk("falahaari", "ALU CHIVDA", 150), nk("falahaari", "SABUDANA FALAHAARI", 140), nk("falahaari", "CHARKA FALAHAARI", 150),
  nk("falahaari", "ALU STICK RED (200)", 150, 120), nk("falahaari", "RAJGIRA SEV", 150),
  nk("falahaari", "RAJGIRA SABUDANA MIX", 150), nk("falahaari", "RAJGIRA BHUJIYA", 150),
  nk("falahaari", "SPECIAL FALAHARI MIXTURE", 220), nk("falahaari", "DRY KHICHDI (200GM)", 150, 120),
  nk("falahaari", "FALHAARI DANE", 150), nk("falahaari", "BADAM LACHA", 220),
  ["namkeen", "falahaari", "CHATORA (70GM)", 0, 0, 0, 50, 0],
  ["namkeen", "falahaari", "FALAHAARI KAPPA WAFERS (MASALA) 100GM", 0, 0, 0, 120, 0],
  ["namkeen", "falahaari", "FALAHAARI KAPPA WAFERS (KALI MIRCH) 100GM", 0, 0, 0, 120, 0],
  ["namkeen", "falahaari", "FALAHAARI KAPPA WAFERS (PODINA) 100GM", 0, 0, 0, 120, 0],
  ["namkeen", "falahaari", "BANANA WAFERS (100GM)", 0, 0, 0, 120, 0],
  ["namkeen", "falahaari", "BANANA WAFERS (200GM)", 0, 0, 0, 240, 0],
  // MATHRI
  nk("mathri", "MINI KACHORI", 150), nk("mathri", "MINI SAMOSA", 150), nk("mathri", "MINI KARELA", 150),
  nk("mathri", "GOL MATHRI", 140), nk("mathri", "METHI MATHRI", 140), nk("mathri", "NAMAK PARA", 140),
  nk("mathri", "KALI MIRCH PARA", 140), nk("mathri", "SANKHE", 140), nk("mathri", "SHAKKAR PARA", 140),
  nk("mathri", "MAIDA KAJU", 140), nk("mathri", "PALAK KATLAS", 140), nk("mathri", "METHI KATLAS", 140),
  nk("mathri", "BHAKAR WADI", 145), nk("mathri", "RASSIBAL", 145), nk("mathri", "MAIDA LOVELY", 140),
  ["namkeen", "mathri", "FALAHARI MATHRI (400GM)", 0, 0, 600, 240, 0],
  ["namkeen", "mathri", "KHASTA MATHRI (400GM)", 0, 0, 400, 160, 0],

  // BAKERY / TEA TIME BITES (PACK)
  ["bakery", "tea-time-bites", "AJWAIN KHARI", 0, 0, 0, 160, 0],
  ["bakery", "tea-time-bites", "BUTTER KHARI", 0, 0, 0, 160, 0],
  ["bakery", "tea-time-bites", "SWEET HEART KHARI", 0, 0, 0, 160, 0],
  ["bakery", "tea-time-bites", "SUJI TOAST", 0, 0, 0, 140, 0],
  ["bakery", "tea-time-bites", "CHERRY TOAST", 0, 0, 0, 140, 0],
  ["bakery", "tea-time-bites", "ATTA TOAST", 0, 0, 0, 140, 0],
  // BAKERY / DRY CAKES & COOKIES
  ["bakery", "dry-cakes-cookies", "MUFFINS", 0, 0, 0, 0, 30],
  ["bakery", "dry-cakes-cookies", "BROWNIE", 0, 0, 0, 0, 80],
  ["bakery", "dry-cakes-cookies", "HONEY ALMOND DRY CAKE", 0, 0, 0, 0, 300],
  ["bakery", "dry-cakes-cookies", "SLICE CAKE", 0, 0, 0, 0, 30],
  ["bakery", "dry-cakes-cookies", "CREAM ROLL VANILLA", 0, 0, 0, 0, 40],
  ["bakery", "dry-cakes-cookies", "CREAM ROLL CHOCOLATE", 0, 0, 0, 0, 50],
  cookie("COCONUT BADAM", 240), cookie("COCONUT COOKIES", 200), cookie("NANKHATAI", 200),
  cookie("JEERA BISCUIT", 200), cookie("AJWAIN BISCUIT", 200), cookie("ATTA BISCUIT", 200),
  cookie("CHOCO CHIPS", 240), cookie("TOOTI FRUITY BISCUIT", 200), cookie("KAJU COOKIES", 300),
  cookie("BADAMIKA", 300), cookie("KESAR PISTAMIKA", 300), cookie("KAJU HONEY", 300),
  cookie("ASSORTED COOKIES", 220), cookie("ALMOND BISCOTTI", 300), cookie("JAM COOKIES", 240),
  cookie("ATTA NANKHATAL", 240), cookie("CASHEW FALAHAARI COOKIES", 300), cookie("FALAHAARI ALMOND STICK", 300),
  cookie("HONEY OATS COOKIES", 300),

  // GAJAK (no subcategory): 500GM / 1KG only
  ...(
    [
      ["MOONGFALI CHIKKI", 400], ["GUD GAJAK", 440], ["GUD ROLL", 440], ["SHAKKAR GAJAK", 440], ["TILL CHIKKI", 440],
      ["TILL LADDU", 440], ["MADRASI CHIKKI", 440], ["MOONGFALI LADDU", 440], ["TILL MOONGFALI CHIKKI", 440],
      ["DRYFRUIT ROLL", 560], ["SOAN GAJAK", 560], ["DRYFRUIT SAMOSA", 560], ["CHOCOLATE GAJAK", 560],
      ["GAJAK BARFI", 560], ["KADA PATTI", 560], ["REVDI", 320], ["PEANUT REVDI", 320],
    ] as [string, number][]
  ).map(([n, p]): HierarchyRow => ["gajak", null, n, 0, p, p * 2, 0, 0]),

  // GIFTING: single price, PACK (PC where the sheet says PCS)
  ...(
    [
      ["DRYFRUIT TRAY (GR10)", 1350], ["DRYFRUIT TRAY (GR6)", 1650], ["DRYFRUIT TRAY (GRS10)", 1350],
      ["DRYFRUIT TRAY (GRS12)", 1800], ["DRYFRUIT TRAY (GS4)", 1350], ["DRYFRUIT TRAY (GS5)", 1350],
      ["DRYFRUIT TRAY SILVER BIG", 2100], ["DRYFRUIT TRAY SILVER SMALL", 1650],
      ["DRYFRUIT BOX -2 JAR", 1200, "pc"], ["DRYFRUIT BOX -3 JAR", 1500, "pc"], ["DRYFRUIT BOX -4 JAR", 1800],
      ["HANDLE DRYFRUIT BOX-2 JAR", 1125], ["HANDLE DRYFRUIT BOX-3 JAR", 1500], ["HANDLE DRYFRUIT BOX-4 JAR", 1950],
      ["DRY FRUIT TOKRI", 1125], ["HANDLE BASKET HAMPER (BIG)", 2200], ["HANDLE BASKET HAMPER (MEDIUM)", 1500],
      ["HANDLE BASKET HAMPER (SMALL)", 1100], ["DRYFRUIT BOX 10*10", 900], ["DRYFRUIT BOX 10*16", 1350],
      ["DRYFRUIT BOX 13*19", 2025], ["DRYFRUIT BOX 8*8", 600], ["DRYFRUIT BOX 9*13", 825],
      ["SUNHAREY BITES BOX", 1200], ["SUNHAREY CHOCOLATE BOX", 600], ["SUNHAREY DRY FRUIT LADDU BOX", 1000],
    ] as [string, number, string?][]
  ).map(([n, p, u]): HierarchyRow => ["gifting", null, n, 0, 0, 0, u ? 0 : p, u ? p : 0]),
];

export const HIERARCHY_CATEGORIES = [
  { slug: "sweets", title: "Sweets", subtitle: "Dryfruit mithai & winter specials", sort_order: 10, featured: true },
  { slug: "namkeen", title: "Namkeen", subtitle: "Sev, mixtures & timepass crunch", sort_order: 20, featured: true },
  { slug: "bakery", title: "Bakery", subtitle: "Tea time bites, dry cakes & cookies", sort_order: 30, featured: false },
  { slug: "gajak", title: "Gajak", subtitle: "Seasonal chikki & gajak specialties", sort_order: 40, featured: false },
  { slug: "gifting", title: "Gifting", subtitle: "Dryfruit trays, boxes & hampers", sort_order: 50, featured: true },
] as const;

export const HIERARCHY_SUBCATEGORIES: Record<string, { slug: string; title: string; sort_order: number }[]> = {
  sweets: [
    { slug: "dryfruit-sweets", title: "Dryfruit Sweets", sort_order: 0 },
    { slug: "winter-special", title: "Winter Special", sort_order: 1 },
  ],
  namkeen: [
    { slug: "sev", title: "Sev", sort_order: 0 },
    { slug: "mixture", title: "Mixture", sort_order: 1 },
    { slug: "timepass", title: "Timepass", sort_order: 2 },
    { slug: "falahaari", title: "Falahaari", sort_order: 3 },
    { slug: "mathri", title: "Mathri", sort_order: 4 },
  ],
  bakery: [
    { slug: "tea-time-bites", title: "Tea Time Bites", sort_order: 0 },
    { slug: "dry-cakes-cookies", title: "Dry Cakes & Cookies", sort_order: 1 },
  ],
};
