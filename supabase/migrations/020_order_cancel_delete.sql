-- Admin order cancel / delete.
-- * Cancelled orders no longer count toward revenue, spend or top-product totals.
--   (Deleted orders disappear from every aggregate automatically.)
-- * Cancelling or deleting an order puts reserved stock back. Stock is only taken
--   by decrement_stock (inventory_logs rows tied to the order), so the net of those
--   rows is exactly what must be returned, which also makes the restore idempotent.

CREATE OR REPLACE FUNCTION restore_order_stock(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row RECORD;
BEGIN
  FOR v_row IN
    SELECT variant_id, -SUM(delta) AS qty
    FROM inventory_logs
    WHERE order_id = p_order_id
    GROUP BY variant_id
    HAVING -SUM(delta) > 0
  LOOP
    UPDATE product_variants
    SET stock_qty = stock_qty + v_row.qty
    WHERE id = v_row.variant_id;

    INSERT INTO inventory_logs (variant_id, delta, reason, order_id)
    VALUES (v_row.variant_id, v_row.qty, 'order_cancelled', p_order_id);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION admin_cancel_order(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status order_status;
BEGIN
  SELECT status INTO v_status FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  IF v_status = 'cancelled' THEN
    RETURN;
  END IF;

  UPDATE orders SET status = 'cancelled', updated_at = now() WHERE id = p_order_id;
  PERFORM restore_order_stock(p_order_id);
END;
$$;

CREATE OR REPLACE FUNCTION admin_delete_order(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status order_status;
BEGIN
  SELECT status INTO v_status FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  PERFORM restore_order_stock(p_order_id);
  DELETE FROM inventory_logs WHERE order_id = p_order_id;
  DELETE FROM order_items WHERE order_id = p_order_id;
  DELETE FROM orders WHERE id = p_order_id;
END;
$$;

-- Revenue excludes cancelled orders.
CREATE OR REPLACE FUNCTION admin_dashboard_kpis()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today TIMESTAMPTZ := date_trunc('day', now());
  v_month TIMESTAMPTZ := date_trunc('month', now());
BEGIN
  RETURN jsonb_build_object(
    'revenue_total_paise', (SELECT COALESCE(SUM(total_paise), 0) FROM orders WHERE status <> 'cancelled'),
    'revenue_today_paise', (SELECT COALESCE(SUM(total_paise), 0) FROM orders WHERE status <> 'cancelled' AND created_at >= v_today),
    'revenue_month_paise', (SELECT COALESCE(SUM(total_paise), 0) FROM orders WHERE status <> 'cancelled' AND created_at >= v_month),
    'orders_total', (SELECT COUNT(*) FROM orders),
    'orders_today', (SELECT COUNT(*) FROM orders WHERE created_at >= v_today),
    'orders_pending', (SELECT COUNT(*) FROM orders WHERE status IN ('pending_payment', 'cod_confirmed', 'confirmed')),
    'orders_completed', (SELECT COUNT(*) FROM orders WHERE status = 'delivered'),
    'orders_cancelled', (SELECT COUNT(*) FROM orders WHERE status = 'cancelled'),
    'products_total', (SELECT COUNT(*) FROM products),
    'products_active', (SELECT COUNT(*) FROM products WHERE published = true),
    'products_low_stock', (
      SELECT COUNT(*) FROM product_variants
      WHERE stock_qty <= COALESCE(low_stock_threshold, 5)
    ),
    'customers', (SELECT COUNT(*) FROM profiles),
    'enquiries_pending', (SELECT COUNT(*) FROM enquiries WHERE status = 'new'),
    'enquiries_corporate', (SELECT COUNT(*) FROM enquiries WHERE type = 'corporate'),
    'outlets', (SELECT COUNT(*) FROM outlets)
  );
END;
$$;

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
    COALESCE(SUM(o.total_paise) FILTER (WHERE o.status <> 'cancelled'), 0)::bigint
  FROM orders o
  WHERE o.created_at >= p_since
  GROUP BY 1;
$$;

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
    COALESCE(SUM(o.total_paise) FILTER (WHERE o.status <> 'cancelled'), 0)::bigint
  FROM orders o
  WHERE COALESCE(o.user_id::text, o.customer_email, '') <> ''
  GROUP BY 1;
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
  JOIN orders o ON o.id = oi.order_id
  WHERE o.status <> 'cancelled'
  GROUP BY oi.name_snapshot
  ORDER BY SUM(oi.qty) DESC
  LIMIT GREATEST(p_limit, 1);
$$;

REVOKE ALL ON FUNCTION restore_order_stock(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION admin_cancel_order(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION admin_delete_order(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION restore_order_stock(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION admin_cancel_order(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION admin_delete_order(UUID) TO service_role;
