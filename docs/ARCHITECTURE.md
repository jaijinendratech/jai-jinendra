# Jai Jinendra — Architecture

Technical architecture for the production e-commerce platform. Next.js 16 is the single app server; Supabase is the system of record.

---

## System overview

```mermaid
flowchart LR
  subgraph client [Browser]
    Store[Storefront App Router]
    Admin[Admin Dashboard]
  end

  subgraph vercel [Vercel]
    Next[Next.js 16 Server]
    API["/api/* routes"]
    SA[Server Actions]
  end

  subgraph supabase [Supabase]
    PG[(Postgres + RLS)]
    SAuth[Auth Phone OTP]
    Storage[Storage bucket]
  end

  subgraph external [External]
    RZP[Razorpay]
    Resend[Resend Email]
  end

  Store --> Next
  Admin --> Next
  Next --> API
  Next --> SA
  API --> PG
  SA --> PG
  Store --> SAuth
  Admin --> SAuth
  API --> Storage
  API --> RZP
  RZP -->|webhook| API
  API --> Resend
```

**Principle:** No separate Express/backend server. All business logic in Next.js API routes, Server Actions, and Supabase RLS.

---

## Database schema (ERD)

```mermaid
erDiagram
  auth_users ||--o| profiles : has
  profiles ||--o{ addresses : owns
  profiles ||--o{ carts : owns
  profiles ||--o{ orders : places

  categories ||--o{ products : contains
  products ||--o{ product_variants : has
  products ||--o{ product_images : has

  carts ||--o{ cart_items : contains
  product_variants ||--o{ cart_items : referenced_by

  orders ||--o{ order_items : contains
  product_variants ||--o{ order_items : snapshot
  orders ||--o{ inventory_logs : triggers

  product_variants ||--o{ inventory_logs : tracked

  profiles {
    uuid id PK
    text phone
    text email
    text full_name
    text role
  }

  categories {
    uuid id PK
    text slug UK
    text title
    text subtitle
    text image_url
    int sort_order
    bool published
  }

  products {
    uuid id PK
    text slug UK
    text name
    text description
    uuid category_id FK
    text spice_note
    text[] dietary
    bool published
  }

  product_variants {
    uuid id PK
    uuid product_id FK
    text label
    text sku UK
    int price_paise
    int mrp_paise
    int weight_g
    int stock_qty
    int low_stock_threshold
  }

  product_images {
    uuid id PK
    uuid product_id FK
    text storage_path
    text alt
    int sort_order
  }

  carts {
    uuid id PK
    uuid user_id FK
    text session_id
    timestamptz updated_at
  }

  cart_items {
    uuid id PK
    uuid cart_id FK
    uuid variant_id FK
    int qty
  }

  addresses {
    uuid id PK
    uuid user_id FK
    text name
    text phone
    text line1
    text line2
    text city
    text state
    text pincode
    bool is_default
  }

  shipping_zones {
    uuid id PK
    text name
    jsonb rules
  }

  orders {
    uuid id PK
    text order_number UK
    uuid user_id FK
    text status
    text payment_method
    text payment_status
    text razorpay_order_id
    jsonb address_snapshot
    int subtotal_paise
    int shipping_paise
    int total_paise
  }

  order_items {
    uuid id PK
    uuid order_id FK
    uuid variant_id FK
    int qty
    int unit_price_paise
    text name_snapshot
  }

  inventory_logs {
    uuid id PK
    uuid variant_id FK
    int delta
    text reason
    uuid order_id FK
  }

  enquiries {
    uuid id PK
    text type
    jsonb payload
    text status
  }

  content_blocks {
    uuid id PK
    text page_key
    text section_key
    jsonb content
  }

  outlets {
    uuid id PK
    text name
    text address
    float lat
    float lng
    text hours
    text phone
  }

  media_assets {
    uuid id PK
    text storage_path
    text alt
    text folder
    uuid uploaded_by FK
  }
```

---

## Row-level security

| Role | Access |
|------|--------|
| **Anonymous** | Read published categories, products, variants (where product published) |
| **Customer** | CRUD own cart, addresses, orders; read own profile |
| **Admin** | Full access when `profiles.role = 'admin'` |

Service role key is server-only (API routes, webhooks, admin batch jobs). Never expose to client.

---

## API routes

All routes under `src/app/api/`. Auth via Supabase session cookie or Bearer token.

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| POST | `/api/auth/otp` | Send phone OTP | Public |
| GET | `/api/cart` | Fetch cart + stock validation | Session |
| POST | `/api/cart` | Add / update / remove items | Session |
| POST | `/api/checkout/validate` | Pincode, inventory, totals | Session |
| POST | `/api/orders/create` | Create order (COD or Razorpay pending) | Session |
| POST | `/api/payments/razorpay/create-order` | Create Razorpay order | Session |
| POST | `/api/webhooks/razorpay` | Payment confirmation | Razorpay signature |
| GET | `/api/orders/[id]` | Order detail | Session (owner or admin) |
| GET | `/api/orders/track` | Track by order_number + phone | Public (limited fields) |
| POST | `/api/enquiries` | Corporate + newsletter | Public |
| GET/POST/PATCH/DELETE | `/api/admin/*` | Admin CRUD | Admin role |

**Server Actions** (alternative for admin forms): products, content blocks, outlets — colocated in `src/app/admin/**/actions.ts`.

---

## Auth flows

### Customer — phone OTP

```mermaid
sequenceDiagram
  participant U as User
  participant N as Next.js
  participant S as Supabase Auth

  U->>N: Enter phone (+91)
  N->>S: signInWithOtp({ phone })
  S-->>U: SMS with OTP
  U->>N: Submit OTP
  N->>S: verifyOtp({ phone, token })
  S-->>N: Session + JWT
  N->>N: Upsert profiles row
  N-->>U: Redirect to checkout or account
```

**Rules:**
- Account required before payment step in checkout
- Email collected at checkout, stored on profile + order snapshot
- Session in HTTP-only cookie via `@supabase/ssr`

### Admin

```mermaid
sequenceDiagram
  participant A as Admin
  participant N as Next.js
  participant S as Supabase Auth
  participant P as profiles

  A->>N: Login (email/password or magic link)
  N->>S: signInWithPassword
  S-->>N: Session
  N->>P: Check role = admin
  alt role admin
    N-->>A: Access /admin/*
  else not admin
    N-->>A: 403 redirect
  end
```

**Middleware:** `src/middleware.ts` validates Supabase session + admin role for `/admin/*` (except `/admin/login`).

---

## Order state machine

```mermaid
stateDiagram-v2
  [*] --> pending_payment: Online pay selected
  [*] --> cod_confirmed: COD selected
  pending_payment --> confirmed: Razorpay webhook
  pending_payment --> cancelled: Timeout or fail
  cod_confirmed --> confirmed: Auto-confirm on create
  confirmed --> dispatched: Admin update
  dispatched --> delivered: Admin update
  confirmed --> cancelled: Admin cancel + restock
  dispatched --> cancelled: Admin cancel + restock
```

| Status | Description |
|--------|-------------|
| `pending_payment` | Razorpay order created; awaiting payment |
| `cod_confirmed` | COD order placed; payment on delivery |
| `confirmed` | Paid or COD accepted; inventory decremented |
| `dispatched` | Shipped |
| `delivered` | Completed |
| `cancelled` | Cancelled; inventory restocked |

**Inventory:** Decrement `product_variants.stock_qty` on transition to `confirmed`. Restock on `cancelled`. Use Postgres transaction with row lock to prevent race conditions.

---

## Razorpay webhook sequence

```mermaid
sequenceDiagram
  participant U as User
  participant N as Next.js
  participant R as Razorpay
  participant DB as Postgres
  participant E as Resend

  U->>N: Complete checkout (online pay)
  N->>DB: Create order (pending_payment)
  N->>R: Create Razorpay order
  R-->>N: razorpay_order_id
  N-->>U: Razorpay checkout modal
  U->>R: Pay
  R->>N: POST /api/webhooks/razorpay
  N->>N: Verify signature (RAZORPAY_WEBHOOK_SECRET)
  N->>DB: Update order → confirmed, payment_status paid
  N->>DB: Decrement inventory (transaction)
  N->>E: Send order confirmation email
  N-->>R: 200 OK
```

**COD path:** Skip Razorpay; create order with `cod_confirmed` → auto `confirmed`; send email; decrement inventory.

---

## Cart & checkout flow

```mermaid
flowchart TD
  A[Add to cart] --> B{Stock OK?}
  B -->|No| C[Show OOS error]
  B -->|Yes| D[Persist cart_items]
  D --> E[Checkout: login if needed]
  E --> F[Address + pincode validate]
  F --> G[POST /api/checkout/validate]
  G --> H{Valid?}
  H -->|No| I[Show errors]
  H -->|Yes| J[Review + payment method]
  J --> K{COD or Online?}
  K -->|COD| L[POST /api/orders/create]
  K -->|Online| M[Razorpay flow]
  L --> N[Confirmation + email]
  M --> N
```

---

## Shipping rules (v1)

Stored in `shipping_zones.rules` JSON:

```json
{
  "type": "pan_india_flat",
  "flat_rate_paise": 7900,
  "free_threshold_paise": 99900
}
```

Pincode validation: India Post API or static pincode table v1.

---

## Email (Resend)

| Trigger | Template |
|---------|----------|
| Order confirmed | Order summary, order number, tracking link |
| Order dispatched | Tracking info (when available) |
| (Future) Order cancelled | Refund / restock notice |

From address: `EMAIL_FROM` env var (default `orders@jaijinendra.com`).

---

## File structure (to create)

```
src/lib/supabase/
  client.ts          # Browser client
  server.ts          # Server client (cookies)
  middleware.ts      # Session refresh helper

src/lib/cart/
  index.ts           # Cart operations

src/lib/orders/
  index.ts           # Order creation, status updates

src/lib/payments/
  razorpay.ts        # Order create, signature verify

src/types/
  database.ts        # Generated Supabase types
  cart.ts            # Cart DTOs
  order.ts           # Order DTOs
```

---

## Environment variables

See [`.env.example`](../.env.example). Required for production:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `RESEND_API_KEY`, `EMAIL_FROM`
- `NEXT_PUBLIC_SITE_URL`

---

## Seed strategy

1. Export current mocks: `catalogue.ts`, `home.ts`, `promise-pages.ts`
2. Migration script or Supabase seed SQL inserts categories, products, variants, content_blocks
3. Keep `src/data/*` for local dev fallback until Sprint 4 removal
