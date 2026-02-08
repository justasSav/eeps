import { describe, it, expect } from 'vitest';
import { cn, formatPrice, generateCartKey } from '@/lib/utils';

describe('cn()', () => {
  it('merges plain classes', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('resolves Tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden')).toBe('base');
  });

  it('handles undefined/null', () => {
    expect(cn('base', undefined, null)).toBe('base');
  });

  it('returns empty for no input', () => {
    expect(cn()).toBe('');
  });
});

describe('formatPrice()', () => {
  it('formats standard price', () => {
    expect(formatPrice(800)).toBe('€8.00');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('€0.00');
  });

  it('formats one cent', () => {
    expect(formatPrice(1)).toBe('€0.01');
  });

  it('formats exact euro', () => {
    expect(formatPrice(100)).toBe('€1.00');
  });

  it('formats cents included', () => {
    expect(formatPrice(1550)).toBe('€15.50');
  });

  it('formats large amount', () => {
    expect(formatPrice(999999)).toBe('€9999.99');
  });

  it('always has 2 decimals', () => {
    expect(formatPrice(500)).toBe('€5.00');
  });
});

describe('generateCartKey()', () => {
  it('returns product ID as-is', () => {
    expect(generateCartKey('prod-1')).toBe('prod-1');
  });

  it('is deterministic', () => {
    expect(generateCartKey('prod-1')).toBe(generateCartKey('prod-1'));
  });

  it('returns different keys for different IDs', () => {
    expect(generateCartKey('a')).not.toBe(generateCartKey('b'));
  });
});
