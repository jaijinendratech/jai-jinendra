-- Catalog architecture redesign (additive)
-- Subcategories, variant unit fields, product metadata, EAV attribute tables

-- ---------------------------------------------------------------------------
-- Subcategories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category
  ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_published_sort
  ON subcategories(category_id, published, sort_order);

-- ---------------------------------------------------------------------------
-- Products — extend
-- ---------------------------------------------------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS seasonal BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);

-- ---------------------------------------------------------------------------
-- Product variants — selling unit semantics
-- ---------------------------------------------------------------------------
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS selling_unit TEXT NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS quantity_value NUMERIC;

-- Backfill selling_unit from label where parseable
UPDATE product_variants
SET
  selling_unit = CASE
    WHEN label ~* '(^|\s)1\s*KG' THEN 'kg'
    WHEN label ~* '(^|\s)(250|500)\s*G' THEN 'g'
    WHEN label ~* 'PACK' THEN 'pack'
    WHEN label ~* '\bPC(S)?\b' THEN 'pc'
    ELSE selling_unit
  END,
  quantity_value = CASE
    WHEN label ~* '(^|\s)250\s*G' THEN 250
    WHEN label ~* '(^|\s)500\s*G' THEN 500
    WHEN label ~* '(^|\s)1\s*KG' THEN 1
    ELSE quantity_value
  END
WHERE selling_unit = 'other';

-- ---------------------------------------------------------------------------
-- Attribute system (EAV — ships empty)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attribute_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  data_type TEXT NOT NULL CHECK (
    data_type IN ('text', 'number', 'boolean', 'select', 'multi_select', 'rich_text', 'number_unit')
  ),
  options JSONB,
  unit TEXT,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS category_attribute_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES attribute_definitions(id) ON DELETE CASCADE,
  required BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE NULLS NOT DISTINCT (category_id, subcategory_id, attribute_id)
);

CREATE INDEX IF NOT EXISTS idx_category_attribute_rules_category
  ON category_attribute_rules(category_id);

CREATE TABLE IF NOT EXISTS product_attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES attribute_definitions(id) ON DELETE CASCADE,
  value_text TEXT,
  value_number NUMERIC,
  value_boolean BOOLEAN,
  value_json JSONB,
  UNIQUE (product_id, attribute_id)
);

CREATE INDEX IF NOT EXISTS idx_product_attribute_values_product
  ON product_attribute_values(product_id);

-- Partial unique: active variant labels per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_active_label
  ON product_variants(product_id, label)
  WHERE available = true;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribute_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_attribute_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attribute_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY subcategories_public_read ON subcategories FOR SELECT
  USING (published = true OR is_admin());
CREATE POLICY subcategories_admin_all ON subcategories FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY attribute_definitions_public_read ON attribute_definitions FOR SELECT
  USING (active = true OR is_admin());
CREATE POLICY attribute_definitions_admin_all ON attribute_definitions FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY category_attribute_rules_public_read ON category_attribute_rules FOR SELECT
  USING (is_admin() OR EXISTS (
    SELECT 1 FROM categories c
    WHERE c.id = category_id AND c.published = true
  ));
CREATE POLICY category_attribute_rules_admin_all ON category_attribute_rules FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY product_attribute_values_public_read ON product_attribute_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id AND (p.published = true OR is_admin())
    )
  );
CREATE POLICY product_attribute_values_admin_all ON product_attribute_values FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- Extend variants public read: only available + price > 0 for anon (admin sees all)
DROP POLICY IF EXISTS variants_public_read ON product_variants;
CREATE POLICY variants_public_read ON product_variants FOR SELECT
  USING (
    is_admin()
    OR (
      available = true
      AND price_paise > 0
      AND EXISTS (
        SELECT 1 FROM products p
        WHERE p.id = product_id AND p.published = true
      )
    )
  );
