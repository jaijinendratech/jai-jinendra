# Stitch design references

Stitch MCP project: **Jai Jinendra Namkeens E-Commerce**

## Manual workflow (when Stitch MCP is unavailable)

1. Open [Google Stitch](https://labs.google/stitch) and select the **Jai Jinendra Namkeens E-Commerce** project.
2. Use [`docs/DESIGN.md`](../DESIGN.md) as the design system reference when generating screens.
3. Export each screen as PNG and save here: `docs/stitch-refs/<screen-name>.png`.

## Screen checklist

### Track A — Checkout
- [ ] Cart (populated, empty, OOS warning)
- [ ] Login / Phone OTP
- [ ] Checkout — address step
- [ ] Checkout — review + payment method
- [ ] Order confirmation
- [ ] Order tracking result

### Track B — Storefront polish
- [ ] Home (hero, featured, trust strip)
- [ ] Catalogue + active filters
- [ ] PDP with variant selector + stock badge
- [ ] Account — profile + order history

### Track C — Admin CMS
- [ ] Products list + edit form
- [ ] Orders list + detail + status update
- [ ] Media library + upload
- [ ] Content editor (homepage sections)
- [ ] Enquiries inbox

## Implementation rules

- Match [`src/lib/design-tokens.ts`](../../src/lib/design-tokens.ts) — no new UI libraries.
- Wire to Supabase only after the schema and API for that screen exist.
- Keep existing App Router paths stable.
