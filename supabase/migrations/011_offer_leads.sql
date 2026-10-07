-- Welcome offer leads. Inserts go through the service-role API.
-- Admins may read the list; there is no public insert policy.

CREATE TABLE IF NOT EXISTS offer_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  coupon_code TEXT NOT NULL DEFAULT 'FLAT10',
  source TEXT NOT NULL DEFAULT 'offer_popup',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS offer_leads_phone_unique ON offer_leads (phone);

ALTER TABLE offer_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS offer_leads_admin_select ON offer_leads;
CREATE POLICY offer_leads_admin_select ON offer_leads FOR SELECT
  USING (is_admin());

INSERT INTO coupons (code, type, value, active)
VALUES ('FLAT10', 'percent', 10, true)
ON CONFLICT DO NOTHING;
