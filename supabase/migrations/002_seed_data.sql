-- Seed categories
INSERT INTO categories (id, name, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Picos', 1),
  ('a1000000-0000-0000-0000-000000000002', 'Kebabai', 2),
  ('a1000000-0000-0000-0000-000000000004', 'Kiti patiekalai', 3),
  ('a1000000-0000-0000-0000-000000000005', 'Gėrimai', 4);

-- Seed products: Picos
INSERT INTO products (id, category_id, name, description, base_price, is_available, dietary_tags) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Margarita', 'Picos padažas, sūris.', 800, true, '{"vegetariškas"}'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Kumpio su grybais', 'Picos padažas, sūris, kumpis, pievagrybiai.', 900, true, '{}'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Havajų', 'Picos padažas, sūris, ananasai, vištiena/kumpis.', 900, true, '{}'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Vegetariška', 'Picos padažas, sūris, pievagrybiai, svogūnai, pomidorai, kons. paprika, alyvuogės.', 1000, true, '{"vegetariškas"}'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Saliami', 'Picos padažas, sūris, saliamis, svogūnas.', 900, true, '{}'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'Sočioji', 'Picos padažas, sūris, šoninė, kumpis, svogūnas, marinuoti agurkai.', 900, true, '{}'),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'Aštrioji', 'Picos padažas, sūris, "Pepperoni" dešra, saliamis, jalapenai.', 900, true, '{"aštrus"}'),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 'Šeimininkės', 'Picos padažas, sūris, šoninė, kumpis, svogūnas, pievagrybiai, kons. paprika, alyvuogės.', 1000, true, '{}'),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001', 'Šefo', 'Picos padažas, sūris, faršas, šoninė, svogūnas, kons. paprika, jalapenai.', 1000, true, '{"aštrus"}');

-- Seed products: Kebabai
INSERT INTO products (id, category_id, name, description, base_price, is_available, dietary_tags) VALUES
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002', 'Kebabas lavašė su vištiena', 'Kebabas lavašė su šviežia vištiena, salotomis ir padažu.', 500, true, '{}'),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000002', 'Kebabas lavašė su vištiena (didelis)', 'Didelis kebabas lavašė su šviežia vištiena, salotomis ir padažu.', 600, true, '{}'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000002', 'Kebabas lavašė su jautiena', 'Kebabas lavašė su jautiena, salotomis ir padažu.', 600, true, '{}'),
  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000002', 'Kebabas lavašė su jautiena (didelis)', 'Didelis kebabas lavašė su jautiena, salotomis ir padažu.', 700, true, '{}'),
  ('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000002', 'Kebabas lėkštėje su vištiena', 'Kebabas lėkštėje su vištiena, salotomis ir padažu.', 600, true, '{}'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000002', 'Kebabas lėkštėje su jautiena', 'Kebabas lėkštėje su jautiena, salotomis ir padažu.', 700, true, '{}');

-- Seed products: Kiti patiekalai
INSERT INTO products (id, category_id, name, description, base_price, is_available, dietary_tags) VALUES
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000004', 'Vištienos kepsneliai', 'Traškūs vištienos kepsneliai.', 400, true, '{}'),
  ('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000004', 'Vištienos kepsneliai (didelė porcija)', 'Didelė porcija traškių vištienos kepsnelių.', 600, true, '{}'),
  ('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000004', 'Vištienos sparneliai', 'Marinuoti vištienos sparneliai.', 500, true, '{}'),
  ('b1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000004', 'Vištienos sparneliai (didelė porcija)', 'Didelė porcija marinuotų vištienos sparnelių.', 600, true, '{}'),
  ('b1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000004', 'Dešrelės su fri bulvytėmis', 'Keptos dešrelės su traškiomis fri bulvytėmis.', 400, true, '{}'),
  ('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000004', 'Dešrelės su fri bulvytėmis (didelė porcija)', 'Didelė porcija keptų dešrelių su traškiomis fri bulvytėmis.', 600, true, '{}'),
  ('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000004', 'Koldūnai', 'Naminiai koldūnai.', 500, true, '{}'),
  ('b1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000004', 'Fri bulvytės', 'Traškios fri bulvytės.', 200, true, '{"vegetariškas"}'),
  ('b1000000-0000-0000-0000-000000000028', 'a1000000-0000-0000-0000-000000000004', 'Kepta duona', 'Kepta juoda duona su česnaku.', 300, true, '{"vegetariškas"}');

-- Seed products: Gėrimai
INSERT INTO products (id, category_id, name, description, base_price, is_available, dietary_tags) VALUES
  ('b1000000-0000-0000-0000-000000000034', 'a1000000-0000-0000-0000-000000000005', 'Alus 0.5L', 'Šviežias alus, 0.5L.', 350, true, '{}'),
  ('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000005', 'Coca-Cola 330ml', 'Coca-Cola skardinė.', 150, true, '{}'),
  ('b1000000-0000-0000-0000-000000000031', 'a1000000-0000-0000-0000-000000000005', 'Fanta 330ml', 'Apelsinų Fanta skardinė.', 150, true, '{}'),
  ('b1000000-0000-0000-0000-000000000032', 'a1000000-0000-0000-0000-000000000005', 'Vanduo 500ml', 'Negazuotas mineralinis vanduo.', 100, true, '{}'),
  ('b1000000-0000-0000-0000-000000000033', 'a1000000-0000-0000-0000-000000000005', 'Coca-Cola 1.5L', 'Didelis butelis Coca-Cola.', 300, true, '{}');
