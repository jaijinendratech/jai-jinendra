# Jai Jinendra — Roadmap

Living document. Update checkboxes as sprints complete. Source plan: E2E project plan (Sep 2026).

---

## Phase overview

| Sprint | Days | Theme | Status |
|--------|------|-------|--------|
| **Sprint 0** | 1–3 | Foundation — docs, Supabase, Stitch, auth | In progress |
| **Sprint 1** | 4–10 | Cart + Auth | Pending |
| **Sprint 2** | 11–18 | Checkout + Payments | Pending |
| **Sprint 3** | 19–25 | Admin CMS + Ops | Pending |
| **Sprint 4** | 26–30 | Hardening + Launch | Pending |

---

## Inventory: done vs remaining

### Done — static prototype

- [x] Next.js 16 storefront (home, catalogue, PDP, experience pages)
- [x] Promise / customer-care pages (purity, freshness, corporate, outlets, support)
- [x] Admin UI shell with mock data (`src/data/admin-mock.ts`)
- [x] Design tokens + brand assets
- [x] Catalog types (`src/types/catalog.ts`)
- [x] Partial SEO (metadata + JSON-LD on home/PDP)
- [x] Demo admin cookie gate (`middleware.ts`)

### Remaining — production

#### Commerce (critical path)

- [ ] Real cart (API + client state)
- [ ] Add to cart / Buy now on PDP + combo builder
- [ ] Checkout route (`/checkout`)
- [ ] Customer login/signup (phone OTP)
- [ ] Razorpay integration + webhooks
- [ ] Order creation + lifecycle
- [ ] Order tracking (real API)
- [ ] Pincode validation (pan-India)
- [ ] Shipping calculator (live rules)

#### Backend / data

- [ ] Supabase project + schema + RLS
- [ ] API routes / server actions
- [ ] Replace `src/data/*` in prod paths
- [ ] `.env.example` + Vercel env vars
- [ ] Resend email templates
- [ ] Admin media upload (Supabase Storage)

#### Admin CMS

- [ ] Products CRUD (persist)
- [ ] Categories CRUD
- [ ] Orders management (status updates)
- [ ] Content editors (home/promise)
- [ ] Enquiries inbox
- [ ] Outlets CRUD
- [ ] Settings persistence
- [ ] Real admin auth (Supabase + role)

#### Frontend gaps

- [ ] Search v1
- [ ] Functional catalogue filters
- [ ] Account pages (`/account`, `/account/orders`)
- [ ] Newsletter + corporate enquiry (real submit)
- [ ] Loading/error/empty states for real data
- [ ] Stitch MCP connected + screens exported

#### Ops / quality

- [ ] Unit / e2e tests
- [ ] CI pipeline
- [ ] `sitemap.ts` / `robots.ts`
- [ ] Monitoring baseline (Sentry / Vercel Analytics)
- [ ] Production deploy

---

## Sprint 0 — Foundation

**Goal:** Docs, database, design system, auth foundation.

### Docs track
- [x] `PROJECT.md`
- [x] `docs/ROADMAP.md`
- [x] `docs/DESIGN.md`
- [x] `docs/ARCHITECTURE.md`
- [x] `.env.example`
- [x] `CLAUDE.md` → references PROJECT.md

### Supabase track
- [ ] Create project
- [ ] Apply schema migrations (see ARCHITECTURE.md)
- [ ] RLS policies (customer vs admin)
- [ ] Seed from `src/data/catalogue.ts`, `home.ts`, `promise-pages.ts`
- [ ] `src/lib/supabase/*` client helpers

### Stitch track
- [ ] Connect Stitch MCP in Cursor
- [ ] Link project **Jai Jinendra Namkeens E-Commerce**
- [ ] Commit DESIGN.md as Stitch reference
- [ ] Export initial checkout screens

### Auth track
- [ ] Supabase Auth phone OTP for customers
- [ ] Admin role via `profiles.role`
- [ ] Replace demo cookie in `middleware.ts`

---

## Sprint 1 — Cart + Auth

**Goal:** Persistent cart, inventory checks, phone login.

- [ ] `/login` — phone OTP (Stitch Track A)
- [ ] `POST/GET /api/cart`
- [ ] Cart client store + header badge
- [ ] Wire Add to Cart on PDP + ComboBuilder
- [ ] Inventory check on add/update
- [ ] `/account` shell (profile stub)

---

## Sprint 2 — Checkout + Payments

**Goal:** End-to-end order placement.

- [ ] `/checkout` multi-step (address → review → pay)
- [ ] Address CRUD + pincode validation
- [ ] `POST /api/checkout/validate`
- [ ] `POST /api/orders/create`
- [ ] Razorpay create-order + webhook
- [ ] COD path
- [ ] Order confirmation page
- [ ] Resend transactional emails
- [ ] Track order API

---

## Sprint 3 — Admin CMS + Ops

**Goal:** Full admin persistence (Stitch Track C).

- [ ] Products / variants / inventory CRUD
- [ ] Orders list + detail + status updates
- [ ] Media library + upload
- [ ] Content blocks editor (home/promise)
- [ ] Enquiries inbox
- [ ] Outlets CRUD

---

## Sprint 4 — Hardening + Launch

**Goal:** Production-ready deploy.

- [ ] Remove all prod reads from `src/data/*`
- [ ] `sitemap.ts`, `robots.ts`, OG audit
- [ ] E2E: browse → login → cart → checkout → track
- [ ] Vercel production + env vars
- [ ] Error monitoring

---

## Parallel tracks

```mermaid
gantt
  title ASAP Parallel Delivery
  dateFormat YYYY-MM-DD
  section Foundation
    Docs plus Supabase schema     :s0, 2026-09-17, 3d
    Stitch MCP plus DESIGN.md     :s0b, 2026-09-17, 3d
  section Frontend Stitch
    Checkout screens              :f1, after s0b, 7d
    Storefront polish             :f2, after s0b, 10d
    Admin CMS screens             :f3, after s0b, 10d
  section Backend
    Auth plus cart API            :b1, after s0, 7d
    Checkout plus Razorpay        :b2, after b1, 8d
    Admin CRUD plus media         :b3, after b2, 7d
  section Launch
    Tests SEO deploy              :l1, after b3, 5d
```

| Track | Priority | Screens / scope |
|-------|----------|-----------------|
| **A — Checkout** | P0 | Cart, OTP login, address, review/pay, confirmation, tracking |
| **B — Storefront** | P1 | Home refine, catalogue filters, PDP variants, account |
| **C — Admin CMS** | P1 | Products, orders, media, content, enquiries |

**Rule:** Backend API for a screen must exist before wiring that screen to Supabase.

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Stitch MCP not connected | Manual export from labs.google/stitch; refs in `docs/stitch-refs/` |
| Phone OTP SMS delivery | Supabase Auth; test with Supabase test numbers first |
| Razorpay webhook on Vercel | Serverless route + signature verification |
| Inventory race at checkout | Postgres transaction: lock variant, check stock, decrement atomically |
| Timeline slip | P0 = checkout + backend Sprints 1–2; storefront polish is P1 |

---

## Definition of done (v1)

See checklist in [`PROJECT.md`](../PROJECT.md#definition-of-done-v1-launch).
