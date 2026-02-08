import { describe, it, expect, vi } from 'vitest';

const mockCategories = [
  { id: 'cat-1', name: 'Picos', sort_order: 1 },
  { id: 'cat-2', name: 'Kebabai', sort_order: 2 },
  { id: 'cat-3', name: 'Kiti patiekalai', sort_order: 3 },
  { id: 'cat-4', name: 'Gėrimai', sort_order: 4 },
];

const mockProducts = [
  { id: 'p1', category_id: 'cat-1', name: 'Margarita', description: 'Picos padažas, sūris.', base_price: 800, image_url: null, is_available: true, dietary_tags: ['vegetariškas'] },
  { id: 'p2', category_id: 'cat-1', name: 'Havajų', description: 'Picos padažas, sūris, ananasai.', base_price: 900, image_url: null, is_available: true, dietary_tags: [] },
  { id: 'p3', category_id: 'cat-2', name: 'Kebabas lavašė su vištiena', description: 'Kebabas.', base_price: 500, image_url: null, is_available: true, dietary_tags: [] },
  { id: 'p4', category_id: 'cat-3', name: 'Vištienos kepsneliai', description: 'Traškūs.', base_price: 400, image_url: null, is_available: true, dietary_tags: [] },
  { id: 'p5', category_id: 'cat-4', name: 'Coca-Cola 330ml', description: 'Skardinė.', base_price: 150, image_url: null, is_available: true, dietary_tags: [] },
];

function createQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  const self = () => builder;
  builder.select = vi.fn(self);
  builder.order = vi.fn(self);
  builder.eq = vi.fn(self);
  builder.then = (resolve: (v: unknown) => unknown, reject?: (r: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return builder;
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'categories') return createQueryBuilder({ data: mockCategories, error: null });
      if (table === 'products') return createQueryBuilder({ data: mockProducts, error: null });
      return createQueryBuilder({ data: null, error: null });
    }),
  },
}));

import { getMenu } from '@/services/menu';

describe('getMenu()', () => {
  it('returns a non-empty Category array', async () => {
    const categories = await getMenu();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  it('contains expected categories', async () => {
    const categories = await getMenu();
    const names = categories.map((c) => c.name);
    expect(names).toContain('Picos');
    expect(names).toContain('Kebabai');
    expect(names).toContain('Kiti patiekalai');
    expect(names).toContain('Gėrimai');
  });

  it('each category has products', async () => {
    const categories = await getMenu();
    for (const cat of categories) {
      expect(cat.products.length).toBeGreaterThan(0);
    }
  });

  it('products have required fields', async () => {
    const categories = await getMenu();
    for (const cat of categories) {
      for (const product of cat.products) {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('base_price');
        expect(product).toHaveProperty('is_available');
        expect(typeof product.id).toBe('string');
        expect(typeof product.name).toBe('string');
        expect(typeof product.base_price).toBe('number');
        expect(typeof product.is_available).toBe('boolean');
      }
    }
  });

  it('prices are integers', async () => {
    const categories = await getMenu();
    for (const cat of categories) {
      for (const product of cat.products) {
        expect(Number.isInteger(product.base_price)).toBe(true);
      }
    }
  });

  it('product IDs are unique', async () => {
    const categories = await getMenu();
    const allIds = categories.flatMap((c) => c.products.map((p) => p.id));
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});
