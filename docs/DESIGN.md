# Design System: Jai Jinendra Namkeens E-Commerce

Single source of truth for Google Stitch screen generation and frontend implementation. Tokens are canonical in [`src/lib/design-tokens.ts`](../src/lib/design-tokens.ts).

**Stitch project:** Jai Jinendra Namkeens E-Commerce

---

## 1. Visual Theme & Atmosphere

A warm, heritage-rich food commerce experience — **gallery-airy density (4)**, **offset-asymmetric layouts (6)**, **fluid restrained motion (5)**. The mood is celebratory yet trustworthy: Rajasthani craft meets modern D2C polish. Surfaces feel like warm parchment and marble counters, not sterile SaaS dashboards.

**Design philosophy:**
- Food is hero — photography leads; UI recedes into warm neutrals
- Heritage without clutter — editorial serif headlines, clean sans body
- Trust signals (pure veg, pan-India shipping, freshness) are structural, not decorative badges
- Checkout and admin surfaces shift to **balanced density (6)** — clarity over ornament

**Brand assets:** `public/brand/logo.png`, `logo-mark.png`, `logo-namkeens.png`

---

## 2. Color Palette & Roles

All values from `brandColors` in design-tokens. One accent family (burgundy/wine primary); green for veg/trust; no purple/neon.

| Descriptive Name | Hex | Role |
|------------------|-----|------|
| **Heritage Wine** | `#640023` | Primary CTA, nav accents, key links |
| **Deep Rosewood** | `#881337` | Primary container, hover states |
| **Blush Highlight** | `#ffb2bd` | Inverse primary, subtle highlights on dark surfaces |
| **Rose Mist** | `#ffd9dd` | Primary fixed — soft backgrounds, badges |
| **Fresh Leaf** | `#006d30` | Secondary — pure veg, success, trust strip |
| **Mint Glow** | `#92f5a4` | Secondary container — veg badges, positive states |
| **Spice Earth** | `#512100` | Tertiary — warm accents, combo/gift contexts |
| **Warm Canvas** | `#fff8f5` | Background, surface — primary page fill |
| **Charcoal Ink** | `#1e1b19` | On-background, on-surface — primary text (not pure black) |
| **Dusty Rose Text** | `#574144` | On-surface variant — secondary text, metadata |
| **Stone Whisper** | `#e9e1dd` | Surface container highest — dividers, card borders |
| **Muted Outline** | `#8a7174` | Outline — form borders, inactive icons |
| **Pure Veg Green** | `#15803d` | Dietary badge — standalone veg indicator |
| **Error Crimson** | `#ba1a1a` | Errors, destructive actions, OOS warnings |

**Rules:**
- Max one accent hue family for CTAs (Heritage Wine). Green is functional (veg/trust), not a second CTA color
- No `#000000`, no neon glows, no purple/blue AI gradients
- Shadows tint toward Warm Canvas (`#fff8f5`), not gray
- Saturation stays below 80% on accents

---

## 3. Typography Rules

| Role | Font | Usage |
|------|------|-------|
| **Display** | Playfair Display | Headlines, hero titles, section eyebrows — track-tight, weight-driven hierarchy |
| **Body** | Plus Jakarta Sans | Body copy, UI labels, buttons, nav — relaxed leading, 65ch max line length |
| **Mono** | System monospace | Order numbers, SKUs, prices in admin tables only |

**Scale (clamp for responsive):**
- Hero display: `clamp(2.25rem, 5vw, 4rem)` — Playfair Display, semibold
- Section title: `clamp(1.75rem, 3vw, 2.5rem)` — Playfair Display
- Body: `1rem` (16px min) — Plus Jakarta Sans, line-height 1.6
- Eyebrow / label: `0.75rem` uppercase, letter-spacing `0.08em` — Plus Jakarta Sans medium

**Banned:** Inter, generic system serif (Times, Georgia, Garamond), pure black text, gradient text on large headers.

**Dashboard (admin):** Sans-serif only — Plus Jakarta Sans throughout. No Playfair in data-dense tables.

---

## 4. Component Stylings

Implement with **HeroUI 3** + Tailwind 4. Reference tokens via CSS variables or `brandColors` imports.

### Buttons
- **Primary:** Heritage Wine (`#640023`) fill, white text, rounded-full or rounded-xl (2rem radius on pill CTAs)
- **Secondary:** Ghost with Stone Whisper border, Charcoal Ink text
- **Active:** Tactile `-1px translateY`, no outer glow
- Min touch target: 44px height

### Cards (product, collection)
- Background: Warm Canvas or white (`surfaceContainerLowest`)
- Border: 1px Stone Whisper or none with diffused shadow
- Radius: `1rem`–`1.5rem` (generous, not bubble-round)
- Use elevation only when hierarchy needs it; catalogue grid can use border-only cards

### Product cards
- Image aspect ratio 4:5 or 1:1 with object-cover
- Price in Charcoal Ink semibold; strikethrough MRP in Dusty Rose Text
- Badge (discount, pure veg) — small pill, Rose Mist or Mint Glow background

### Inputs / forms (checkout, admin)
- Label above field (no floating labels)
- Border: Muted Outline; focus ring: Heritage Wine 2px
- Error text below in Error Crimson
- Phone input: +91 prefix for OTP flow

### Navigation
- Site header: sticky, Warm Canvas background, logo left, cart/account right
- Admin sidebar: Deep Rosewood or Charcoal Ink sidebar, white/mint active state

### Trust strip
- Horizontal row of icon + title + description
- Icons from Lucide — eco, package, veg, shipping mapped in catalog types

### Loading states
- Skeleton shimmer matching card/layout dimensions — Warm Canvas → Stone Whisper gradient
- No generic circular spinners on content areas

### Empty states (cart, orders, search)
- Composed layout: illustration or product silhouette + headline + single CTA
- "Your basket is waiting" tone — warm, not corporate

### Stock / OOS
- Low stock: Spice Earth text badge
- Out of stock: Error Crimson badge; disable add-to-cart

---

## 5. Layout Principles

From `layoutTokens`:

| Token | Value |
|-------|-------|
| Max width | `1720px` |
| Page margin (desktop) | `3rem` |
| Page margin (mobile) | `1rem` |
| Grid gutter | `1.5rem` |

**Rules:**
- CSS Grid for page sections and product grids — no flex percentage hacks
- Hero: asymmetric split (copy left, imagery right) on desktop — centered hero banned
- Product grid: 2-col mobile → 3–4 col desktop; avoid generic 3 equal feature cards
- Section spacing: `clamp(3rem, 8vw, 6rem)` vertical gap
- Full viewport sections: `min-h-[100dvh]` — never `h-screen`
- No overlapping text and imagery — clean spatial zones
- Breadcrumbs above page content on inner pages

**Catalogue:** Filters sidebar (desktop) / drawer (mobile) + product grid.main

**Checkout:** Single-column focused flow on mobile; 2-col (summary sticky right) on desktop

---

## 6. Motion & Interaction

- **Default easing:** Spring-like — `cubic-bezier(0.34, 1.56, 0.64, 1)` or CSS `transition` 200–300ms ease-out
- **Hero carousel:** Crossfade or subtle slide; autoplay 5–6s with pause on hover
- **List reveals:** Staggered fade-up (50ms delay per item) on catalogue load
- **Micro-interactions:** Cart badge pulse on add; button active press feedback
- **Performance:** Animate `transform` and `opacity` only — no layout-triggering animations
- **Reduced motion:** Respect `prefers-reduced-motion` — disable carousel autoplay and stagger

**Banned motion:** Bouncing scroll chevrons, "scroll to explore" hints, neon pulse effects.

---

## 7. Stitch Screen List

Generate in parallel tracks; export refs to `docs/stitch-refs/`.

### Track A — Checkout (P0)
1. Cart — populated, empty, OOS warning
2. Login — phone OTP entry + verify
3. Checkout — address step
4. Checkout — review + payment method (Razorpay / COD)
5. Order confirmation
6. Order tracking result

### Track B — Storefront (P1)
1. Home — hero, featured, trust strip refine
2. Catalogue — active filter states
3. PDP — variant selector + stock badge
4. Account — profile + order history

### Track C — Admin (P1)
1. Products list + edit form
2. Orders list + detail + status update
3. Media library + upload
4. Content editor (homepage sections)
5. Enquiries inbox

---

## 8. Anti-Patterns (Banned)

**Visual**
- No emojis in UI copy
- No Inter or generic system UI font stacks
- No pure black (`#000000`) or neon purple/blue accents
- No outer glow shadows or oversaturated gradients
- No centered hero when asymmetry is specified
- No 3-column equal "feature card" rows
- No overlapping text on images

**Content**
- No AI clichés: "Elevate", "Seamless", "Unleash", "Next-Gen", "Crafted with love" (overused)
- No fake metrics (`99.99%`, `50% off everything`)
- No placeholder names (John Doe, Acme Corp)
- No filler: "Scroll to explore", swipe hints, bouncing arrows

**Technical**
- No new UI libraries beyond HeroUI
- No broken stock photo URLs — use project assets in `public/images/`
- No custom cursors

---

## 9. Implementation Checklist

When implementing a Stitch export into the codebase:

1. Match hex values to `brandColors` — do not invent new colors
2. Use Playfair Display + Plus Jakarta Sans (already in layout/fonts)
3. HeroUI components for buttons, inputs, modals, drawers
4. Lucide icons — consistent 20–24px stroke
5. Save Stitch PNG reference alongside PR
6. Wire to Supabase only after API exists for that screen
