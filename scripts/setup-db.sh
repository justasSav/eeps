#!/bin/bash
# Setup Supabase database tables and seed data via Management API.
#
# Usage:
#   SUPABASE_ACCESS_TOKEN=sbp_xxxxx bash scripts/setup-db.sh
#
# Get a token at: https://supabase.com/dashboard/account/tokens

set -e

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "Error: SUPABASE_ACCESS_TOKEN not set."
  echo "Get one at: https://supabase.com/dashboard/account/tokens"
  exit 1
fi

REF="aqzguzbwpojvrkfcajsg"
API="https://api.supabase.com/v1/projects/${REF}/database/query"
AUTH="Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}"

run_sql() {
  local label="$1"
  local sql="$2"
  echo "=== $label ==="
  PAYLOAD=$(jq -n --arg q "$sql" '{"query": $q}')
  RESULT=$(curl -s -X POST "$API" \
    -H "$AUTH" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")
  echo "$RESULT"
  echo ""
}

# Step 1: Create tables
run_sql "Create tables" "$(cat <<'EOF'
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  base_price INTEGER NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  dietary_tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);

CREATE TABLE IF NOT EXISTS modifier_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_required INTEGER NOT NULL DEFAULT 0,
  max_allowed INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_modifier_groups_product ON modifier_groups(product_id);

CREATE TABLE IF NOT EXISTS modifier_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_mod INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_modifier_options_group ON modifier_options(group_id);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('delivery', 'pickup')),
  status TEXT NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')),
  delivery_address JSONB,
  contact_phone TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  base_price INTEGER NOT NULL,
  modifiers JSONB NOT NULL DEFAULT '{}',
  item_total INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
EOF
)"

# Step 2: RLS policies
run_sql "Enable RLS + policies" "$(cat <<'EOF'
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Menu is publicly readable') THEN
    CREATE POLICY "Menu is publicly readable" ON categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Products are publicly readable') THEN
    CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Modifier groups are publicly readable') THEN
    CREATE POLICY "Modifier groups are publicly readable" ON modifier_groups FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Modifier options are publicly readable') THEN
    CREATE POLICY "Modifier options are publicly readable" ON modifier_options FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own orders') THEN
    CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create own orders') THEN
    CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own order items') THEN
    CREATE POLICY "Users can view own order items" ON order_items FOR SELECT
      USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create own order items') THEN
    CREATE POLICY "Users can create own order items" ON order_items FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $t$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$t$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EOF
)"

# Step 3: Seed categories
run_sql "Seed categories" "INSERT INTO categories (id, name, sort_order) VALUES ('a1000000-0000-0000-0000-000000000001', 'Picos', 1), ('a1000000-0000-0000-0000-000000000002', 'Kebabai', 2), ('a1000000-0000-0000-0000-000000000004', 'Kiti patiekalai', 3), ('a1000000-0000-0000-0000-000000000005', 'Gėrimai', 4) ON CONFLICT (id) DO NOTHING;"

# Step 4: Seed products
run_sql "Seed products" "$(cat <<'EOF'
INSERT INTO products (id, category_id, name, description, base_price, is_available, dietary_tags) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Margarita', 'Picos padažas, sūris.', 800, true, '{"vegetariškas"}'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Kumpio su grybais', 'Picos padažas, sūris, kumpis, pievagrybiai.', 900, true, '{}'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Havajų', 'Picos padažas, sūris, ananasai, vištiena/kumpis.', 900, true, '{}'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Vegetariška', 'Picos padažas, sūris, pievagrybiai, svogūnai, pomidorai, kons. paprika, alyvuogės.', 1000, true, '{"vegetariškas"}'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Saliami', 'Picos padažas, sūris, saliamis, svogūnas.', 900, true, '{}'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'Sočioji', 'Picos padažas, sūris, šoninė, kumpis, svogūnas, marinuoti agurkai.', 900, true, '{}'),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'Aštrioji', 'Picos padažas, sūris, "Pepperoni" dešra, saliamis, jalapenai.', 900, true, '{"aštrus"}'),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 'Šeimininkės', 'Picos padažas, sūris, šoninė, kumpis, svogūnas, pievagrybiai, kons. paprika, alyvuogės.', 1000, true, '{}'),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001', 'Šefo', 'Picos padažas, sūris, faršas, šoninė, svogūnas, kons. paprika, jalapenai.', 1000, true, '{"aštrus"}'),
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002', 'Kebabas lavašė su vištiena', 'Kebabas lavašė su šviežia vištiena, salotomis ir padažu.', 500, true, '{}'),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000002', 'Kebabas lavašė su vištiena (didelis)', 'Didelis kebabas lavašė su šviežia vištiena, salotomis ir padažu.', 600, true, '{}'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000002', 'Kebabas lavašė su jautiena', 'Kebabas lavašė su jautiena, salotomis ir padažu.', 600, true, '{}'),
  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000002', 'Kebabas lavašė su jautiena (didelis)', 'Didelis kebabas lavašė su jautiena, salotomis ir padažu.', 700, true, '{}'),
  ('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000002', 'Kebabas lėkštėje su vištiena', 'Kebabas lėkštėje su vištiena, salotomis ir padažu.', 600, true, '{}'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000002', 'Kebabas lėkštėje su jautiena', 'Kebabas lėkštėje su jautiena, salotomis ir padažu.', 700, true, '{}'),
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000004', 'Vištienos kepsneliai', 'Traškūs vištienos kepsneliai.', 400, true, '{}'),
  ('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000004', 'Vištienos kepsneliai (didelė porcija)', 'Didelė porcija traškių vištienos kepsnelių.', 600, true, '{}'),
  ('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000004', 'Vištienos sparneliai', 'Marinuoti vištienos sparneliai.', 500, true, '{}'),
  ('b1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000004', 'Vištienos sparneliai (didelė porcija)', 'Didelė porcija marinuotų vištienos sparnelių.', 600, true, '{}'),
  ('b1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000004', 'Dešrelės su fri bulvytėmis', 'Keptos dešrelės su traškiomis fri bulvytėmis.', 400, true, '{}'),
  ('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000004', 'Dešrelės su fri bulvytėmis (didelė porcija)', 'Didelė porcija keptų dešrelių su traškiomis fri bulvytėmis.', 600, true, '{}'),
  ('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000004', 'Koldūnai', 'Naminiai koldūnai.', 500, true, '{}'),
  ('b1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000004', 'Fri bulvytės', 'Traškios fri bulvytės.', 200, true, '{"vegetariškas"}'),
  ('b1000000-0000-0000-0000-000000000028', 'a1000000-0000-0000-0000-000000000004', 'Kepta duona', 'Kepta juoda duona su česnaku.', 300, true, '{"vegetariškas"}'),
  ('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000005', 'Coca-Cola 330ml', 'Coca-Cola skardinė.', 150, true, '{}'),
  ('b1000000-0000-0000-0000-000000000031', 'a1000000-0000-0000-0000-000000000005', 'Fanta 330ml', 'Apelsinų Fanta skardinė.', 150, true, '{}'),
  ('b1000000-0000-0000-0000-000000000032', 'a1000000-0000-0000-0000-000000000005', 'Vanduo 500ml', 'Negazuotas mineralinis vanduo.', 100, true, '{}'),
  ('b1000000-0000-0000-0000-000000000033', 'a1000000-0000-0000-0000-000000000005', 'Coca-Cola 1.5L', 'Didelis butelis Coca-Cola.', 300, true, '{}'),
  ('b1000000-0000-0000-0000-000000000034', 'a1000000-0000-0000-0000-000000000005', 'Alus 0.5L', 'Šviežias alus, 0.5L.', 350, true, '{}')
ON CONFLICT (id) DO NOTHING;
EOF
)"

echo "=== Done! ==="
echo ""
echo "IMPORTANT: Also enable Anonymous Sign-ins in your Supabase Dashboard:"
echo "  https://supabase.com/dashboard/project/${REF}/auth/providers"
echo "  Toggle on 'Anonymous Sign-ins'"
echo ""

# Verify with the publishable key
ANON_KEY="${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:-your-anon-key}"
echo "=== Verifying... ==="
curl -s "https://${REF}.supabase.co/rest/v1/categories?select=name,sort_order&order=sort_order" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}"
echo ""
