export {
  ADMIN_SESSION_COOKIE,
  ADMIN_EMAIL,
  getAdminPassword as getAdminDemoPassword,
} from "@/lib/admin-config";

export type AdminNavItem = {
  href: string;
  label: string;
  group: "overview" | "catalog" | "commerce" | "content" | "ops";
};

export const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", group: "overview" },
  { href: "/admin/products", label: "Products", group: "catalog" },
  { href: "/admin/categories", label: "Categories", group: "catalog" },
  { href: "/admin/combos", label: "Combos", group: "catalog" },
  { href: "/admin/inventory", label: "Inventory", group: "catalog" },
  { href: "/admin/orders", label: "Orders", group: "commerce" },
  { href: "/admin/customers", label: "Customers", group: "commerce" },
  { href: "/admin/coupons", label: "Coupons", group: "commerce" },
  { href: "/admin/content/home", label: "Homepage content", group: "content" },
  { href: "/admin/content/carousels", label: "Carousels", group: "content" },
  { href: "/admin/media", label: "Media", group: "content" },
  { href: "/admin/enquiries", label: "Enquiries", group: "ops" },
  { href: "/admin/outlets", label: "Outlets", group: "ops" },
  { href: "/admin/settings", label: "Settings", group: "ops" },
];

export type MockOrderStatus =
  | "pending"
  | "confirmed"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type MockOrder = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  city: string;
  total: number;
  status: MockOrderStatus;
  placedAt: string;
  items: { name: string; qty: number; price: number }[];
  notes?: string;
};

export const mockOrders: MockOrder[] = [
  {
    id: "JJ-10428",
    customer: "Ananya Kulkarni",
    email: "ananya@example.com",
    phone: "+91 98765 43210",
    city: "Bengaluru",
    total: 1240,
    status: "dispatched",
    placedAt: "2026-09-14T08:20:00+05:30",
    items: [
      { name: "Shahi Kaju Mixture · 400g", qty: 2, price: 299 },
      { name: "Ratlami Sev · 250g", qty: 2, price: 195 },
    ],
    notes: "Leave at society gate",
  },
  {
    id: "JJ-10427",
    customer: "Rajesh Singhania",
    email: "rajesh@corp.example",
    phone: "+91 98111 22334",
    city: "Gurugram",
    total: 17800,
    status: "confirmed",
    placedAt: "2026-09-13T16:45:00+05:30",
    items: [
      { name: "Royal Rajasthan Heritage Box", qty: 20, price: 890 },
    ],
    notes: "Corporate Diwali — multi-address sheet attached",
  },
  {
    id: "JJ-10426",
    customer: "Pooja Chhabra",
    email: "pooja@example.com",
    phone: "+91 98200 11223",
    city: "Mumbai",
    total: 550,
    status: "delivered",
    placedAt: "2026-09-12T11:10:00+05:30",
    items: [{ name: "Silver Vark Kaju Katli · 250g", qty: 1, price: 550 }],
  },
  {
    id: "JJ-10425",
    customer: "Dev Mehta",
    email: "dev@example.com",
    phone: "+91 99000 44556",
    city: "Ahmedabad",
    total: 890,
    status: "pending",
    placedAt: "2026-09-14T10:05:00+05:30",
    items: [{ name: "Custom Combo Box (4-item)", qty: 1, price: 890 }],
  },
];

export type MockEnquiry = {
  id: string;
  name: string;
  company: string;
  email: string;
  quantity: number;
  status: "new" | "in_progress" | "closed";
  receivedAt: string;
  notes: string;
};

export const mockEnquiries: MockEnquiry[] = [
  {
    id: "ENQ-221",
    name: "Neha Kapoor",
    company: "Horizon Tech Pvt Ltd",
    email: "neha@horizon.example",
    quantity: 150,
    status: "new",
    receivedAt: "2026-09-14T09:30:00+05:30",
    notes: "Diwali client gifts — Delhi, Pune, Hyderabad",
  },
  {
    id: "ENQ-220",
    name: "Amit Shah",
    company: "Shah Weddings",
    email: "amit@shahweddings.example",
    quantity: 80,
    status: "in_progress",
    receivedAt: "2026-09-11T14:00:00+05:30",
    notes: "Guest favours with wax seal personalisation",
  },
];

export const mockMediaAssets = [
  { id: "m1", name: "hero0.jpg", path: "/images/hero0.jpg", kind: "hero" },
  { id: "m2", name: "prod0.jpg", path: "/images/prod0.jpg", kind: "product" },
  { id: "m3", name: "banner.jpg", path: "/images/banner.jpg", kind: "banner" },
  { id: "m4", name: "heritage.jpg", path: "/images/heritage.jpg", kind: "story" },
  { id: "m5", name: "logo-namkeens.png", path: "/brand/logo-namkeens.png", kind: "brand" },
] as const;

export const dashboardStats = {
  ordersToday: 18,
  revenueToday: 64250,
  lowStock: 4,
  openEnquiries: 2,
  pendingOrders: 5,
} as const;
