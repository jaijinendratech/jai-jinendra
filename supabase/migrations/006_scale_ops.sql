-- Phase 2: KPI aggregates, webhook dedupe, Shiprocket token store, storage RLS

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
    'revenue_total_paise', (SELECT COALESCE(SUM(total_paise), 0) FROM orders),
    'revenue_today_paise', (SELECT COALESCE(SUM(total_paise), 0) FROM orders WHERE created_at >= v_today),
    'revenue_month_paise', (SELECT COALESCE(SUM(total_paise), 0) FROM orders WHERE created_at >= v_month),
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

REVOKE ALL ON FUNCTION admin_dashboard_kpis() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_dashboard_kpis() TO service_role;

-- Razorpay webhook event dedupe
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  event_type TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at
  ON webhook_events (received_at DESC);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhook_events_admin ON webhook_events FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- Shared Shiprocket token across serverless instances
CREATE TABLE IF NOT EXISTS integration_tokens (
  provider TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE integration_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY integration_tokens_admin ON integration_tokens FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- Content: public SELECT only for known storefront pages (tighten drafts later via page_key)
DROP POLICY IF EXISTS content_public_read ON content_blocks;
CREATE POLICY content_public_read ON content_blocks FOR SELECT
  USING (
    is_admin()
    OR page_key IN (
      'home', 'sweets', 'kachoris', 'hampers', 'combos', 'promise', 'catalogue'
    )
  );

DROP POLICY IF EXISTS media_public_read ON media_assets;
CREATE POLICY media_public_read ON media_assets FOR SELECT
  USING (true);

-- Storage bucket policies for `media` (idempotent; bucket must exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'media'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS media_public_select ON storage.objects';
    EXECUTE $pol$
      CREATE POLICY media_public_select ON storage.objects
        FOR SELECT TO public
        USING (bucket_id = 'media')
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS media_admin_insert ON storage.objects';
    EXECUTE $pol$
      CREATE POLICY media_admin_insert ON storage.objects
        FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'media' AND public.is_admin())
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS media_admin_update ON storage.objects';
    EXECUTE $pol$
      CREATE POLICY media_admin_update ON storage.objects
        FOR UPDATE TO authenticated
        USING (bucket_id = 'media' AND public.is_admin())
        WITH CHECK (bucket_id = 'media' AND public.is_admin())
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS media_admin_delete ON storage.objects';
    EXECUTE $pol$
      CREATE POLICY media_admin_delete ON storage.objects
        FOR DELETE TO authenticated
        USING (bucket_id = 'media' AND public.is_admin())
    $pol$;
  END IF;
END $$;
