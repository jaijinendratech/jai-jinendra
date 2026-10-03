-- Global storefront order and a landing-page-only thali plate image.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS thali_image_path TEXT;

-- Current A–Z listing becomes positions 1..N.
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY name) AS rn
  FROM products
)
UPDATE products AS p
SET sort_order = ranked.rn
FROM ranked
WHERE p.id = ranked.id;

CREATE INDEX IF NOT EXISTS idx_products_sort_order
  ON products (sort_order, name);

-- One statement assigns sort_order from the id list (1-based ordinality).
-- service_role is the admin server client (auth.uid() is null there).
-- authenticated callers must pass is_admin(), same check as 002/004.
CREATE OR REPLACE FUNCTION reorder_products(ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') IS DISTINCT FROM 'service_role' AND NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can reorder products';
  END IF;

  IF ids IS NULL OR cardinality(ids) = 0 THEN
    RAISE EXCEPTION 'reorder_products: ids required';
  END IF;

  UPDATE products AS p
  SET sort_order = ordered.ord::int
  FROM unnest(ids) WITH ORDINALITY AS ordered(id, ord)
  WHERE p.id = ordered.id;
END;
$$;

REVOKE ALL ON FUNCTION reorder_products(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reorder_products(uuid[]) TO service_role;
GRANT EXECUTE ON FUNCTION reorder_products(uuid[]) TO authenticated;
