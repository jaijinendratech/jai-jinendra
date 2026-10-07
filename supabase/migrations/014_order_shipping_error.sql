-- Last Shiprocket auto-shipment failure for an order (shown in admin; retry from there).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_error TEXT;
