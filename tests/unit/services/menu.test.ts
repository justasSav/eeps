import { describe, it, expect } from 'vitest';
import { getMenu } from '@/services/menu';

describe('getMenu()', () => {
  const categories = getMenu();

  it('returns a non-empty Category array', () => {
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  it('contains expected number of categories', () => {
    const names = categories.map((c) => c.name);
    expect(names).toContain('Picos');
    expect(names).toContain('Kebabai');
    expect(names).toContain('Kiti patiekalai');
    expect(names).toContain('Gėrimai');
  });

  it('each category has products', () => {
    for (const cat of categories) {
      expect(cat.products.length).toBeGreaterThan(0);
    }
  });

  it('products have required fields', () => {
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

  it('prices are integers', () => {
    for (const cat of categories) {
      for (const product of cat.products) {
        expect(Number.isInteger(product.base_price)).toBe(true);
      }
    }
  });

  it('product IDs are unique', () => {
    const allIds = categories.flatMap((c) => c.products.map((p) => p.id));
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});
