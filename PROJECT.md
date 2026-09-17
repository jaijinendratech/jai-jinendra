# Jai Jinendra — Agent Context

> **Attach this file to every agent prompt** alongside `AGENTS.md`. This is the single source of product truth, stack lock, and sprint focus. Update when decisions change.

---

## Product truth

**Brand:** Jai Jinendra Namkeens — heritage Rajasthani namkeens, mithai, kachoris, gifts, and combos.

**Commerce model:** Full checkout — cart → auth → address → pay → order → track.

| Area | Rule |
|------|------|
| Shipping | Pan-India at launch; flat rate ₹79, free on orders ≥ ₹999 |
| Payments | Razorpay (UPI / cards / netbanking) + COD (non-gateway path) |
| Customer auth | **Account required** before payment |
| Login | Phone OTP (primary via Supabase Auth); email collected at checkout |
| Inventory | Full stock tracking per SKU/variant; block checkout when OOS |
| Notifications | Email only at launch (Resend) |
| Categories | namkeens, kachoris, mithai, gifts, tea-time, dry-fruits, combos |

---

## Stack lock

Do not introduce alternate backends, UI libraries, or payment providers without explicit approval.

| Layer | Choice |
|-------|--------|
| Framework | Next.js **16** (App Router) — read `node_modules/next/dist/docs/` before API changes |
| Database / Auth / Storage | Supabase (Postgres + RLS + Auth + Storage) |
| Payments | Razorpay |
| Email | Resend |
| UI | HeroUI 3 + Tailwind CSS 4 |
| Icons | Lucide React |
| Hosting | Vercel |

---

## File map

```
src/
├── app/                          # App Router pages
│   ├── page.tsx                  # Home
│   ├── catalogue/                # Catalogue + category filters
│   ├── products/[slug]/          # Product detail (PDP)
│   ├── cart/                     # Cart (→ wire to API)
│   ├── checkout/                 # CREATE — multi-step checkout
│   ├── login/                    # CREATE — phone OTP
│   ├── account/                  # CREATE — profile + orders
│   ├── track-order/              # Order tracking
│   ├── combos/, sweets/, …       # Experience pages
│   ├── corporate/, outlets/, …   # Promise / customer-care pages
│   ├── admin/
│   │   ├── login/                # Admin login
│   │   └── (dashboard)/          # CMS: products, orders, content, media, …
│   └── api/                      # CREATE — REST routes (see docs/ARCHITECTURE.md)
├── components/
│   ├── layout/                   # SiteHeader, SiteFooter, AnnouncementBar
│   ├── home/                     # Home sections
│   ├── catalogue/                # Filters, toolbar, hero
│   ├── products/                 # ProductCard, ProductDetailView
│   ├── experience/               # Category views, ComboBuilder
│   ├── admin/                    # AdminShell
│   └── shared/                   # Breadcrumbs, PageHeroCarousel
├── lib/
│   ├── design-tokens.ts          # Brand colors, fonts, layout tokens
│   ├── format.ts                 # Currency / display helpers
│   ├── admin-auth.ts             # Demo cookie auth (→ replace with Supabase)
│   ├── supabase/                 # CREATE — client + server helpers
│   ├── cart/                     # CREATE — cart logic
│   ├── orders/                   # CREATE — order logic
│   └── payments/razorpay.ts      # CREATE — Razorpay integration
├── types/
│   └── catalog.ts                # Frontend catalog types (see Data contracts)
└── data/                         # Mock seed data — NOT for production reads
    ├── catalogue.ts
    ├── home.ts
    ├── admin-mock.ts
    └── …

public/
├── brand/                        # Logos (logo.png, logo-mark.png, …)
└── images/                       # Product / hero / category images

docs/
├── ROADMAP.md                    # Living sprint plan
├── DESIGN.md                     # Stitch design system
└── ARCHITECTURE.md               # Schema, API, auth, order flows
```

---

## Data contracts

Frontend types live in [`src/types/catalog.ts`](src/types/catalog.ts). Supabase tables map as follows:

| TypeScript (`catalog.ts`) | Supabase table | Notes |
|---------------------------|----------------|-------|
| `Category` | `categories` | `id` → slug; `image` → `image_url` |
| `Product` | `products` + `product_variants` + `product_images` | `price`/`originalPrice` → variant `price_paise`/`mrp_paise`; `variants[]` → `product_variants` rows |
| `ProductVariant` | `product_variants` | Add `sku`, `stock_qty`, `weight_g` |
| `CataloguePill`, `CatalogueFilterOption` | UI-only | Derived from categories + product counts |
| Cart (TBD) | `carts`, `cart_items` | New types in `src/types/cart.ts` when implemented |
| Order (TBD) | `orders`, `order_items` | New types in `src/types/order.ts` when implemented |
| Content blocks | `content_blocks` | Home heroes, promise copy from `home.ts`, `promise-pages.ts` |
| Enquiries | `enquiries` | Corporate + newsletter payloads |
| Outlets | `outlets` | Store locations |

**Money:** Store as integer paise in DB; display as INR in UI via `src/lib/format.ts`.

**Generated types:** After Supabase setup, generate with `supabase gen types typescript` → `src/types/database.ts`. Prefer generated types for API/server code; keep `catalog.ts` for storefront component props until unified.

---

## Forbidden actions (agents)

1. **No mock data in production paths** — do not add new reads from `src/data/*` in pages, API routes, or server actions intended for production. Mocks are seed scripts only.
2. **Read Next.js 16 docs** — before changing routing, middleware, caching, or server APIs, consult `node_modules/next/dist/docs/`. This is not Next.js 14/15.
3. **No hallucinated env vars** — only use variables documented in [`.env.example`](.env.example). Do not invent secret names.
4. **No alternate stack** — no Express server, no Prisma, no Stripe, no Firebase, no shadcn (HeroUI is locked).
5. **No new UI libraries** — implement Stitch exports with existing HeroUI + Tailwind tokens.
6. **No skipping inventory checks** — cart add/update and checkout must validate `stock_qty`.
7. **No committing secrets** — never commit `.env`, service role keys, or Razorpay secrets.
8. **Do not edit the plan file** — update `docs/ROADMAP.md` and this file instead.

---

## Stitch workflow

| Item | Value |
|------|-------|
| Stitch project name | **Jai Jinendra Namkeens E-Commerce** |
| Design system doc | [`docs/DESIGN.md`](docs/DESIGN.md) |
| Screen refs | Export to `docs/stitch-refs/<screen>.png` |
| Implementation | HeroUI + tokens from `src/lib/design-tokens.ts` — no new UI library |

**Parallel tracks:** Checkout (P0) → Storefront polish (P1) → Admin CMS (P1). Wire to Supabase only after schema + API exist for that screen.

---

## Current sprint focus

**Sprint 0 — Foundation** (in progress)

| Track | Work |
|-------|------|
| Docs | PROJECT.md, ROADMAP, DESIGN, ARCHITECTURE, .env.example |
| Supabase | Schema migrations, RLS, seed from mocks, client helpers |
| Stitch | Connect MCP, link project, generate screens from DESIGN.md |
| Auth | Replace demo cookie admin with Supabase Auth + roles |

---

## Definition of done (v1 launch)

- [ ] Customer must login (phone OTP) before payment
- [ ] Full pan-India checkout with address + pincode validation
- [ ] Razorpay test payment completes → order confirmed → email sent
- [ ] COD creates order without gateway charge
- [ ] Inventory blocks OOS checkout
- [ ] Admin can manage products, stock, orders, content, media
- [ ] Track order works with order number + phone
- [ ] No production reads from `src/data/*` mocks
- [ ] `PROJECT.md` accurate and linked from `CLAUDE.md`
- [ ] Deployed on Vercel with all env vars

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for phase breakdown.
