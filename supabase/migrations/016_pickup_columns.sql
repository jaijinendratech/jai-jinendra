-- Pickup request details for orders marked ready to ship.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS pickup_scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pickup_token TEXT,
  ADD COLUMN IF NOT EXISTS pickup_error TEXT,
  ADD COLUMN IF NOT EXISTS label_url TEXT,
  ADD COLUMN IF NOT EXISTS manifest_url TEXT;
