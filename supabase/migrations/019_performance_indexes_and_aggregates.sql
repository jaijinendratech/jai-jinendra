-- Performance: cover foreign keys / hot filters with indexes, drop indexes that
-- duplicate a UNIQUE constraint, and move admin dashboard aggregation into SQL
-- (PostgREST caps responses at 1000 rows, so JS-side aggregation was both slow
-- and silently wrong on larger tables).

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- Order detail, invoices, admin order list (order_items(qty) embed), top products.
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant ON order_items (variant_id);

-- Product detail / listings embed product_images.
CREATE INDEX IF NOT EXISTS idx_product_images_product
  ON product_images (product_id, sort_order);

-- Account address book.
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses (user_id);

-- "My orders" lists filter by user and sort newest first; this composite also
-- serves plain user_id lookups, so the single-column index is redundant.
CREATE INDEX IF NOT EXISTS idx_orders_user_created
  ON orders (user_id, created_at DESC);
DROP INDEX IF EXISTS idx_orders_user;

-- FK cascades on variant/product deletes and admin inventory history.
CREATE INDEX IF NOT EXISTS idx_cart_items_variant ON cart_items (variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_variant
  ON inventory_logs (variant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_combo_items_product ON combo_items (product_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_variant ON combo_items (variant_id);
CREATE INDEX IF NOT EXISTS idx_category_attribute_rules_subcategory
  ON category_attribute_rules (subcategory_id);
CREATE INDEX IF NOT EXISTS idx_category_attribute_rules_attribute
  ON category_attribute_rules (attribute_id);
CREATE INDEX IF NOT EXISTS idx_product_attribute_values_attribute
  ON product_attribute_values (attribute_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by
  ON media_assets (uploaded_by);

-- orders.order_number is UNIQUE (orders_order_number_key already indexes it).
DROP INDEX IF EXISTS idx_orders_number;
DROP INDEX IF EXISTS idx_orders_order_number;

-- ---------------------------------------------------------------------------
-- Admin dashboard aggregates (service role only, like admin_dashboard_kpis)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION admin_order_status_counts()
RETURNS TABLE (status TEXT, order_count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.status::text, COUNT(*)::bigint
  FROM orders o
  GROUP BY o.status;
$$;

CREATE OR REPLACE FUNCTION admin_top_products(p_limit INT DEFAULT 5)
RETURNS TABLE (name TEXT, sold BIGINT, revenue_paise BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    oi.name_snapshot,
    SUM(oi.qty)::bigint,
    SUM(oi.qty * oi.unit_price_paise)::bigint
  FROM order_items oi
  GROUP BY oi.name_snapshot
  ORDER BY SUM(oi.qty) DESC
  LIMIT GREATEST(p_limit, 1);
$$;

-- Day buckets use the UTC calendar date, matching dateKey() in lib/admin/queries.ts.
CREATE OR REPLACE FUNCTION admin_order_daily_series(p_since TIMESTAMPTZ)
RETURNS TABLE (day DATE, order_count BIGINT, revenue_paise BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (o.created_at AT TIME ZONE 'UTC')::date AS day,
    COUNT(*)::bigint,
    COALESCE(SUM(o.total_paise), 0)::bigint
  FROM orders o
  WHERE o.created_at >= p_since
  GROUP BY 1;
$$;

-- Keyed like the JS fallback: user id when present, else checkout email.
CREATE OR REPLACE FUNCTION admin_customer_order_stats()
RETURNS TABLE (customer_key TEXT, order_count BIGINT, spent_paise BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(o.user_id::text, o.customer_email) AS customer_key,
    COUNT(*)::bigint,
    COALESCE(SUM(o.total_paise), 0)::bigint
  FROM orders o
  WHERE COALESCE(o.user_id::text, o.customer_email, '') <> ''
  GROUP BY 1;
$$;

REVOKE ALL ON FUNCTION admin_order_status_counts() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION admin_top_products(INT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION admin_order_daily_series(TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION admin_customer_order_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_order_status_counts() TO service_role;
GRANT EXECUTE ON FUNCTION admin_top_products(INT) TO service_role;
GRANT EXECUTE ON FUNCTION admin_order_daily_series(TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION admin_customer_order_stats() TO service_role;
