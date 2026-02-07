-- Seed categories
INSERT INTO categories (id, name, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Picos', 1),
  ('a1000000-0000-0000-0000-000000000002', 'Kebabs', 2),
  ('a1000000-0000-0000-0000-000000000003', 'Sides', 3),
  ('a1000000-0000-0000-0000-000000000004', 'Drinks', 4);

-- Seed products: Picos
INSERT INTO products (id, category_id, name, description, base_price, is_available, dietary_tags) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Margarita', 'Picos padažas, sūris.', 700, true, '{"vegetarian"}'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Kumpio su grybais', 'Picos padažas, sūris, kumpis, pievagrybiai.', 800, true, '{}'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Havajų', 'Picos padažas, sūris, ananasai, vištiena/kumpis.', 800, true, '{}'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Vegetariška', 'Picos padažas, sūris, pievagrybiai, svogūnai, pomidorai, kons. paprika, alyvuogės.', 800, true, '{"vegetarian"}'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Saliami', 'Picos padažas, sūris, saliamis, svogūnas.', 800, true, '{}'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'Sočioji', 'Picos padažas, sūris, šoninė, kumpis, svogūnas, marinuoti agurkai.', 800, true, '{}'),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'Aštrioji', 'Picos padažas, sūris, "Pepperoni" dešra, saliamis, jalapenai.', 800, true, '{"spicy"}'),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 'Šeimininkės', 'Picos padažas, sūris, šoninė, kumpis, svogūnas, pievagrybiai, kons. paprika, alyvuogės.', 900, true, '{}'),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001', 'Šefo', 'Picos padažas, sūris, faršas, šoninė, svogūnas, kons. paprika, jalapenai.', 900, true, '{"spicy"}');

-- Seed products: Kebabs
INSERT INTO products (id, category_id, name, description, base_price, is_available, dietary_tags) VALUES
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002', 'Chicken Doner', 'Freshly shaved chicken doner with salad and sauce.', 750, true, '{}'),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000002', 'Lamb Doner', 'Traditional lamb doner with all the trimmings.', 850, true, '{}'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000002', 'Mixed Doner', 'Best of both — chicken and lamb doner combined.', 950, true, '{}'),
  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000002', 'Chicken Shish', 'Marinated chicken breast pieces, chargrilled to order.', 1050, true, '{}');

-- Seed products: Sides
INSERT INTO products (id, category_id, name, description, base_price, is_available, dietary_tags) VALUES
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000003', 'Chips', 'Crispy golden chips.', 300, true, '{"vegetarian"}'),
  ('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000003', 'Cheesy Chips', 'Chips topped with melted cheese.', 400, true, '{"vegetarian"}'),
  ('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000003', 'Garlic Bread', 'Toasted garlic bread with herbs.', 350, true, '{"vegetarian"}'),
  ('b1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000003', 'Chicken Wings (6pc)', 'Spicy marinated chicken wings.', 550, true, '{"spicy"}');

-- Seed products: Drinks
INSERT INTO products (id, category_id, name, description, base_price, is_available, dietary_tags) VALUES
  ('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000004', 'Coca-Cola 330ml', 'Classic Coca-Cola can.', 150, true, '{"vegetarian"}'),
  ('b1000000-0000-0000-0000-000000000031', 'a1000000-0000-0000-0000-000000000004', 'Fanta 330ml', 'Orange Fanta can.', 150, true, '{"vegetarian"}'),
  ('b1000000-0000-0000-0000-000000000032', 'a1000000-0000-0000-0000-000000000004', 'Water 500ml', 'Still mineral water.', 100, true, '{"vegetarian"}'),
  ('b1000000-0000-0000-0000-000000000033', 'a1000000-0000-0000-0000-000000000004', '1.5L Coca-Cola', 'Large bottle of Coca-Cola.', 300, true, '{"vegetarian"}');
