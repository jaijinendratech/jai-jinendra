-- Welcome-offer popup now collects an email so the coupon can be delivered.
-- Self-contained: also creates offer_leads (from 011) if it was never applied.

CREATE TABLE IF NOT EXISTS offer_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  coupon_code TEXT NOT NULL DEFAULT 'FLAT10',
  source TEXT NOT NULL DEFAULT 'offer_popup',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE offer_leads ADD COLUMN IF NOT EXISTS email TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS offer_leads_phone_unique ON offer_leads (phone);

ALTER TABLE offer_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS offer_leads_admin_select ON offer_leads;
CREATE POLICY offer_leads_admin_select ON offer_leads FOR SELECT
  USING (is_admin());

INSERT INTO coupons (code, type, value, active)
VALUES ('FLAT10', 'percent', 10, true)
ON CONFLICT DO NOTHING;
