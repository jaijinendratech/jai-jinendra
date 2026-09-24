-- Coupons: admin-managed discount codes applied at checkout

CREATE TYPE coupon_type AS ENUM ('percent', 'fixed');

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  type coupon_type NOT NULL,
  -- percent: 1–100; fixed: discount amount in paise
  value INT NOT NULL CHECK (value > 0),
  min_order_paise INT NOT NULL DEFAULT 0 CHECK (min_order_paise >= 0),
  max_discount_paise INT CHECK (max_discount_paise IS NULL OR max_discount_paise > 0),
  active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  usage_limit INT CHECK (usage_limit IS NULL OR usage_limit > 0),
  used_count INT NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT coupons_code_upper CHECK (code = upper(code)),
  CONSTRAINT coupons_percent_range CHECK (
    type <> 'percent' OR (value >= 1 AND value <= 100)
  ),
  CONSTRAINT coupons_dates_ok CHECK (
    expires_at IS NULL OR starts_at IS NULL OR expires_at > starts_at
  )
);

CREATE UNIQUE INDEX coupons_code_unique ON coupons (code);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS discount_paise INT NOT NULL DEFAULT 0
    CHECK (discount_paise >= 0),
  ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS coupon_code TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON orders (coupon_id)
  WHERE coupon_id IS NOT NULL;

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Public may read active coupons only via service role validation;
-- storefront never selects coupons with user JWT for apply — API uses admin client.
-- Admins manage coupons through the dashboard (service role / is_admin).
CREATE POLICY coupons_admin_all ON coupons FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- Atomic redeem: re-validates and increments used_count under row lock.
CREATE OR REPLACE FUNCTION redeem_coupon(
  p_coupon_id UUID,
  p_subtotal_paise INT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
  v_discount INT := 0;
  v_now TIMESTAMPTZ := now();
BEGIN
  IF p_subtotal_paise IS NULL OR p_subtotal_paise < 0 THEN
    RAISE EXCEPTION 'invalid_subtotal';
  END IF;

  SELECT * INTO v_coupon
  FROM coupons
  WHERE id = p_coupon_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'coupon_not_found';
  END IF;

  IF NOT v_coupon.active THEN
    RAISE EXCEPTION 'coupon_inactive';
  END IF;

  IF v_coupon.starts_at IS NOT NULL AND v_now < v_coupon.starts_at THEN
    RAISE EXCEPTION 'coupon_not_started';
  END IF;

  IF v_coupon.expires_at IS NOT NULL AND v_now > v_coupon.expires_at THEN
    RAISE EXCEPTION 'coupon_expired';
  END IF;

  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
    RAISE EXCEPTION 'coupon_usage_limit';
  END IF;

  IF p_subtotal_paise < v_coupon.min_order_paise THEN
    RAISE EXCEPTION 'coupon_min_order';
  END IF;

  IF v_coupon.type = 'percent' THEN
    v_discount := floor(p_subtotal_paise * v_coupon.value / 100.0)::INT;
    IF v_coupon.max_discount_paise IS NOT NULL THEN
      v_discount := LEAST(v_discount, v_coupon.max_discount_paise);
    END IF;
  ELSE
    v_discount := v_coupon.value;
  END IF;

  v_discount := LEAST(v_discount, p_subtotal_paise);
  IF v_discount <= 0 THEN
    RAISE EXCEPTION 'coupon_no_discount';
  END IF;

  UPDATE coupons
  SET used_count = used_count + 1,
      updated_at = v_now
  WHERE id = v_coupon.id;

  RETURN v_discount;
END;
$$;

REVOKE ALL ON FUNCTION redeem_coupon(UUID, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION redeem_coupon(UUID, INT) TO service_role;
