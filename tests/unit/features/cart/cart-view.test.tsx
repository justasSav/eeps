import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CartItem } from '@/types';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock the cart store to avoid "getSnapshot should be cached" issue with getTotal()
const mockItems = vi.fn<() => CartItem[]>().mockReturnValue([]);
const mockGetTotal = vi.fn<() => number>().mockReturnValue(0);
const mockClearCart = vi.fn();

vi.mock('@/store/cart', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/cart')>();
  return {
    ...actual,
    useCartStore: (selector: (state: unknown) => unknown) => {
      const mockState = {
        items: mockItems(),
        getTotal: mockGetTotal,
        clearCart: mockClearCart,
      };
      return selector(mockState);
    },
  };
});

const sampleItems: CartItem[] = [
  {
    cart_key: 'prod-margarita',
    product_id: 'prod-margarita',
    product_name: 'Margarita',
    quantity: 2,
    base_price: 800,
    item_total: 1600,
  },
];

let CartView: typeof import('@/features/cart/cart-view').CartView;

beforeEach(async () => {
  const mod = await import('@/features/cart/cart-view');
  CartView = mod.CartView;
  mockItems.mockReturnValue([]);
  mockGetTotal.mockReturnValue(0);
  mockClearCart.mockReset();
});

describe('CartView', () => {
  it('empty cart shows empty state', () => {
    render(<CartView />);
    expect(screen.getByText('Jūsų krepšelis tuščias')).toBeInTheDocument();
  });

  it('empty cart shows browse button', () => {
    render(<CartView />);
    const browseLink = screen.getByText('Naršyti meniu').closest('a');
    expect(browseLink).toHaveAttribute('href', '/');
  });

  it('filled cart shows items', () => {
    mockItems.mockReturnValue(sampleItems);
    mockGetTotal.mockReturnValue(1600);
    render(<CartView />);
    expect(screen.getByText('Margarita')).toBeInTheDocument();
  });

  it('shows total', () => {
    mockItems.mockReturnValue(sampleItems);
    mockGetTotal.mockReturnValue(1600);
    render(<CartView />);
    // Both item_total and total are €16.00, use getAllByText
    const priceElements = screen.getAllByText('€16.00');
    expect(priceElements.length).toBeGreaterThanOrEqual(1);
    // The total section contains "Iš viso" label
    expect(screen.getByText('Iš viso')).toBeInTheDocument();
  });

  it('clear all button calls clearCart', async () => {
    const user = userEvent.setup();
    mockItems.mockReturnValue(sampleItems);
    mockGetTotal.mockReturnValue(1600);
    render(<CartView />);
    await user.click(screen.getByText('Išvalyti viską'));
    expect(mockClearCart).toHaveBeenCalledTimes(1);
  });

  it('checkout button links to /checkout', () => {
    mockItems.mockReturnValue(sampleItems);
    mockGetTotal.mockReturnValue(1600);
    render(<CartView />);
    const checkoutLink = screen.getByText('Pereiti prie apmokėjimo').closest('a');
    expect(checkoutLink).toHaveAttribute('href', '/checkout');
  });
});
