import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CartItem } from '@/types';

const sampleCartItem: CartItem = {
  cart_key: 'prod-margarita',
  product_id: 'prod-margarita',
  product_name: 'Margarita',
  quantity: 2,
  base_price: 800,
  item_total: 1600,
};

// Mock cart store
const mockUpdateQuantity = vi.fn();
const mockRemoveItem = vi.fn();

vi.mock('@/store/cart', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/cart')>();
  return {
    ...actual,
    useCartStore: (selector: (state: unknown) => unknown) => {
      const mockState = {
        updateQuantity: mockUpdateQuantity,
        removeItem: mockRemoveItem,
      };
      return selector(mockState);
    },
  };
});

let CartItemRow: typeof import('@/features/cart/cart-item-row').CartItemRow;

beforeEach(async () => {
  const mod = await import('@/features/cart/cart-item-row');
  CartItemRow = mod.CartItemRow;
  mockUpdateQuantity.mockReset();
  mockRemoveItem.mockReset();
});

describe('CartItemRow', () => {
  it('renders product name', () => {
    render(<CartItemRow item={sampleCartItem} />);
    expect(screen.getByText('Margarita')).toBeInTheDocument();
  });

  it('renders item total', () => {
    render(<CartItemRow item={sampleCartItem} />);
    expect(screen.getByText('€16.00')).toBeInTheDocument();
  });

  it('renders quantity', () => {
    render(<CartItemRow item={sampleCartItem} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('plus button increments', async () => {
    const user = userEvent.setup();
    render(<CartItemRow item={sampleCartItem} />);
    const buttons = screen.getAllByRole('button');
    // Plus button is the second button (after minus)
    const plusButton = buttons[1];
    await user.click(plusButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-margarita', 3);
  });

  it('minus button decrements', async () => {
    const user = userEvent.setup();
    render(<CartItemRow item={sampleCartItem} />);
    const buttons = screen.getAllByRole('button');
    // Minus button is the first button
    const minusButton = buttons[0];
    await user.click(minusButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-margarita', 1);
  });

  it('trash button removes', async () => {
    const user = userEvent.setup();
    render(<CartItemRow item={sampleCartItem} />);
    const buttons = screen.getAllByRole('button');
    // Trash button is the last button
    const trashButton = buttons[buttons.length - 1];
    await user.click(trashButton);
    expect(mockRemoveItem).toHaveBeenCalledWith('prod-margarita');
  });
});
