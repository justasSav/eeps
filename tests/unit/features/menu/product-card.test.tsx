import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '@/features/menu/product-card';
import type { Product } from '@/types';

const baseProduct: Product = {
  id: 'prod-margarita',
  category_id: 'cat-picos',
  name: 'Margarita',
  description: 'Picos padažas, sūris.',
  base_price: 800,
  image_url: 'https://example.com/pizza.jpg',
  is_available: true,
  dietary_tags: [],
};

const vegProduct: Product = {
  ...baseProduct,
  id: 'prod-veg',
  name: 'Vegetariška',
  dietary_tags: ['vegetariškas'],
};

const spicyProduct: Product = {
  ...baseProduct,
  id: 'prod-spicy',
  name: 'Aštrioji',
  dietary_tags: ['aštrus'],
};

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={baseProduct} onAdd={vi.fn()} />);
    expect(screen.getByText('Margarita')).toBeInTheDocument();
  });

  it('renders product description', () => {
    render(<ProductCard product={baseProduct} onAdd={vi.fn()} />);
    expect(screen.getByText('Picos padažas, sūris.')).toBeInTheDocument();
  });

  it('renders price via formatPrice', () => {
    render(<ProductCard product={baseProduct} onAdd={vi.fn()} />);
    expect(screen.getByText('€8.00')).toBeInTheDocument();
  });

  it('renders product image', () => {
    render(<ProductCard product={baseProduct} onAdd={vi.fn()} />);
    const img = screen.getByAltText('Margarita');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/pizza.jpg');
  });

  it('add button calls onAdd', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ProductCard product={baseProduct} onAdd={onAdd} />);
    await user.click(screen.getByText('Pridėti'));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(baseProduct);
  });

  it('shows quantity prefix when > 0', () => {
    render(<ProductCard product={baseProduct} onAdd={vi.fn()} quantity={2} />);
    expect(screen.getByText('2 ×')).toBeInTheDocument();
  });

  it('blue left border when in cart', () => {
    const { container } = render(
      <ProductCard product={baseProduct} onAdd={vi.fn()} quantity={1} />
    );
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('border-l-blue-500');
  });

  it('transparent border when not in cart', () => {
    const { container } = render(
      <ProductCard product={baseProduct} onAdd={vi.fn()} quantity={0} />
    );
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('border-l-transparent');
  });

  it('vegetarian tag renders green badge', () => {
    render(<ProductCard product={vegProduct} onAdd={vi.fn()} />);
    const badge = screen.getByText('vegetariškas');
    expect(badge.className).toContain('bg-green-100');
  });

  it('spicy tag renders red badge', () => {
    render(<ProductCard product={spicyProduct} onAdd={vi.fn()} />);
    const badge = screen.getByText('aštrus');
    expect(badge.className).toContain('bg-red-100');
  });
});
