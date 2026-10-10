-- Welcome-offer popup now collects an email so the coupon can be delivered.
ALTER TABLE offer_leads ADD COLUMN IF NOT EXISTS email TEXT;
