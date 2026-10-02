-- Product-detail copy, merchandising tags, and catalogue filter metadata.
-- Attribute tables already exist (007). This only adds columns.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS shipping_title TEXT,
  ADD COLUMN IF NOT EXISTS shipping_note TEXT,
  ADD COLUMN IF NOT EXISTS highlights TEXT[],
  ADD COLUMN IF NOT EXISTS tags TEXT[];

ALTER TABLE attribute_definitions
  ADD COLUMN IF NOT EXISTS filterable BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS filter_group TEXT;

-- Keep today's shipping card until an admin clears both fields.
UPDATE products
SET
  shipping_title = 'Pan-India Express',
  shipping_note = 'Dispatched in 24 hrs • Free above ₹999'
WHERE shipping_title IS NULL
  AND shipping_note IS NULL;

-- Surface the four existing merchandising flags as tags.
UPDATE products
SET tags = ARRAY_REMOVE(ARRAY[
  CASE WHEN featured THEN 'Featured' END,
  CASE WHEN bestseller THEN 'Bestseller' END,
  CASE WHEN new_arrival THEN 'New arrival' END,
  CASE WHEN seasonal THEN 'Seasonal' END
], NULL)
WHERE tags IS NULL
  AND (featured OR bestseller OR new_arrival OR seasonal);
