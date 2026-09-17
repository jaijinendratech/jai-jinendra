-- Row Level Security policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles
CREATE POLICY profiles_select_own ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());
CREATE POLICY profiles_update_own ON profiles FOR UPDATE
  USING (id = auth.uid() OR is_admin());

-- Catalog (public read published)
CREATE POLICY categories_public_read ON categories FOR SELECT
  USING (published = true OR is_admin());
CREATE POLICY categories_admin_all ON categories FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY products_public_read ON products FOR SELECT
  USING (published = true OR is_admin());
CREATE POLICY products_admin_all ON products FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY variants_public_read ON product_variants FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND (p.published = true OR is_admin()))
  );
CREATE POLICY variants_admin_all ON product_variants FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY images_public_read ON product_images FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND (p.published = true OR is_admin()))
  );
CREATE POLICY images_admin_all ON product_images FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- Carts: owner by user_id or session (service role handles anon session carts via API)
CREATE POLICY carts_select_own ON carts FOR SELECT
  USING (user_id = auth.uid() OR is_admin());
CREATE POLICY carts_insert_own ON carts FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY carts_update_own ON carts FOR UPDATE
  USING (user_id = auth.uid() OR is_admin());
CREATE POLICY carts_delete_own ON carts FOR DELETE
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY cart_items_via_cart ON cart_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_id AND (c.user_id = auth.uid() OR is_admin()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_id AND (c.user_id = auth.uid() OR is_admin()))
  );

-- Addresses
CREATE POLICY addresses_own ON addresses FOR ALL
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Shipping zones (public read)
CREATE POLICY shipping_zones_read ON shipping_zones FOR SELECT USING (active = true OR is_admin());
CREATE POLICY shipping_zones_admin ON shipping_zones FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- Orders
CREATE POLICY orders_select_own ON orders FOR SELECT
  USING (user_id = auth.uid() OR is_admin());
CREATE POLICY orders_insert_own ON orders FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_admin());
CREATE POLICY orders_update_admin ON orders FOR UPDATE
  USING (is_admin());

CREATE POLICY order_items_via_order ON order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR is_admin()))
  );
CREATE POLICY order_items_admin ON order_items FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- Inventory logs (admin only)
CREATE POLICY inventory_logs_admin ON inventory_logs FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- Enquiries: anyone can insert, admin reads
CREATE POLICY enquiries_insert_public ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY enquiries_admin ON enquiries FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- Content & outlets (public read published)
CREATE POLICY content_public_read ON content_blocks FOR SELECT USING (true);
CREATE POLICY content_admin ON content_blocks FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY outlets_public_read ON outlets FOR SELECT
  USING (published = true OR is_admin());
CREATE POLICY outlets_admin ON outlets FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY media_admin ON media_assets FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY media_public_read ON media_assets FOR SELECT USING (true);
