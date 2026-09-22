-- Atomic inventory + order payment idempotency + indexes

-- Non-negative stock
ALTER TABLE product_variants
  DROP CONSTRAINT IF EXISTS product_variants_stock_qty_nonnegative;
ALTER TABLE product_variants
  ADD CONSTRAINT product_variants_stock_qty_nonnegative CHECK (stock_qty >= 0);

-- Idempotent inventory deductions per order line
CREATE UNIQUE INDEX IF NOT EXISTS inventory_logs_order_variant_unique
  ON inventory_logs (order_id, variant_id)
  WHERE order_id IS NOT NULL;

-- Performance / lookup indexes
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id
  ON orders (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc
  ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number
  ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone
  ON orders (customer_phone)
  WHERE customer_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_logs_order_id
  ON inventory_logs (order_id)
  WHERE order_id IS NOT NULL;

-- Atomic stock decrement (fails if insufficient)
CREATE OR REPLACE FUNCTION decrement_stock(
  p_variant_id UUID,
  p_qty INT,
  p_order_id UUID
)
RETURNS product_variants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row product_variants;
BEGIN
  IF p_qty IS NULL OR p_qty <= 0 THEN
    RAISE EXCEPTION 'decrement_stock: qty must be positive';
  END IF;

  -- Already deducted for this order+variant → no-op (idempotent)
  IF EXISTS (
    SELECT 1 FROM inventory_logs
    WHERE order_id = p_order_id AND variant_id = p_variant_id
  ) THEN
    SELECT * INTO v_row FROM product_variants WHERE id = p_variant_id;
    RETURN v_row;
  END IF;

  UPDATE product_variants
  SET stock_qty = stock_qty - p_qty
  WHERE id = p_variant_id
    AND stock_qty >= p_qty
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for variant %', p_variant_id;
  END IF;

  INSERT INTO inventory_logs (variant_id, delta, reason, order_id)
  VALUES (p_variant_id, -p_qty, 'order_confirmed', p_order_id);

  RETURN v_row;
END;
$$;

-- Claim order payment + decrement all lines atomically
CREATE OR REPLACE FUNCTION confirm_order_payment(
  p_order_id UUID,
  p_razorpay_payment_id TEXT DEFAULT NULL
)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders;
  v_item RECORD;
BEGIN
  UPDATE orders
  SET
    status = 'confirmed',
    payment_status = 'paid',
    razorpay_payment_id = COALESCE(p_razorpay_payment_id, razorpay_payment_id),
    updated_at = now()
  WHERE id = p_order_id
    AND payment_status = 'pending'
  RETURNING * INTO v_order;

  -- Already paid / confirmed — return current row (idempotent)
  IF NOT FOUND THEN
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;
    RETURN v_order;
  END IF;

  FOR v_item IN
    SELECT variant_id, qty
    FROM order_items
    WHERE order_id = p_order_id
      AND variant_id IS NOT NULL
  LOOP
    PERFORM decrement_stock(v_item.variant_id, v_item.qty, p_order_id);
  END LOOP;

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION decrement_stock(UUID, INT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION confirm_order_payment(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION confirm_order_payment(UUID, TEXT) TO service_role;
