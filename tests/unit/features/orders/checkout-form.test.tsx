import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CartItem } from '@/types';

const mockPush = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock stores — avoid importOriginal to prevent loading real Supabase modules
const mockItems = vi.fn<() => CartItem[]>().mockReturnValue([]);
const mockGetTotal = vi.fn<() => number>().mockReturnValue(0);
const mockClearCart = vi.fn();
const mockSubmitOrder = vi.fn().mockResolvedValue('123');

vi.mock('@/store/cart', () => ({
  useCartStore: (selector: (state: unknown) => unknown) => {
    const mockState = {
      items: mockItems(),
      getTotal: mockGetTotal,
      clearCart: mockClearCart,
    };
    return selector(mockState);
  },
}));

vi.mock('@/store/orders', () => ({
  useOrderStore: (selector: (state: unknown) => unknown) => {
    const mockState = {
      submitOrder: mockSubmitOrder,
    };
    return selector(mockState);
  },
}));

const sampleItems: CartItem[] = [
  {
    cart_key: 'prod-margarita',
    product_id: 'prod-margarita',
    product_name: 'Margarita',
    quantity: 2,
    base_price: 800,
    item_total: 1600,
  },
  {
    cart_key: 'prod-havaju',
    product_id: 'prod-havaju',
    product_name: 'Havajų',
    quantity: 1,
    base_price: 900,
    item_total: 900,
  },
];

let CheckoutForm: typeof import('@/features/orders/checkout-form').CheckoutForm;

beforeEach(async () => {
  const mod = await import('@/features/orders/checkout-form');
  CheckoutForm = mod.CheckoutForm;
  mockItems.mockReturnValue(sampleItems);
  mockGetTotal.mockReturnValue(2500);
  mockClearCart.mockReset();
  mockSubmitOrder.mockReset().mockResolvedValue('123');
  mockPush.mockClear();
});

describe('CheckoutForm', () => {
  it('renders fulfillment toggle', () => {
    render(<CheckoutForm />);
    expect(screen.getByText('Atsiėmimas')).toBeInTheDocument();
    expect(screen.getByText('Pristatymas')).toBeInTheDocument();
  });

  it('default fulfillment is pickup', () => {
    render(<CheckoutForm />);
    const pickupBtn = screen.getByText('Atsiėmimas');
    expect(pickupBtn.className).toContain('border-orange-500');
  });

  it('switching to delivery shows address fields', async () => {
    const user = userEvent.setup();
    render(<CheckoutForm />);
    await user.click(screen.getByText('Pristatymas'));
    expect(screen.getByPlaceholderText('Gatvė')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Miestas')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Pašto kodas')).toBeInTheDocument();
  });

  it('pickup hides address fields', () => {
    render(<CheckoutForm />);
    expect(screen.queryByPlaceholderText('Gatvė')).toBeNull();
  });

  it('phone input always visible', () => {
    render(<CheckoutForm />);
    expect(screen.getByPlaceholderText('+370 600 00000')).toBeInTheDocument();
  });

  it('validation: empty phone shows error', async () => {
    const user = userEvent.setup();
    render(<CheckoutForm />);
    await user.click(screen.getByText('Pateikti užsakymą'));
    expect(screen.getByText('Telefono numeris privalomas.')).toBeInTheDocument();
  });

  it('validation: delivery needs street', async () => {
    const user = userEvent.setup();
    render(<CheckoutForm />);
    await user.click(screen.getByText('Pristatymas'));
    await user.type(screen.getByPlaceholderText('+370 600 00000'), '+37060000000');
    await user.click(screen.getByText('Pateikti užsakymą'));
    expect(screen.getByText('Pristatymo adresas privalomas.')).toBeInTheDocument();
  });

  it('summary shows cart items', () => {
    render(<CheckoutForm />);
    expect(screen.getByText('2x Margarita')).toBeInTheDocument();
    expect(screen.getByText('1x Havajų')).toBeInTheDocument();
  });

  it('summary shows total', () => {
    render(<CheckoutForm />);
    // Total: 1600 + 900 = 2500 → €25.00
    expect(screen.getByText('€25.00')).toBeInTheDocument();
  });

  it('successful submit calls submitOrder and redirects', async () => {
    const user = userEvent.setup();
    render(<CheckoutForm />);
    await user.type(screen.getByPlaceholderText('+370 600 00000'), '+37060000000');
    await user.click(screen.getByText('Pateikti užsakymą'));
    await waitFor(() => {
      expect(mockSubmitOrder).toHaveBeenCalledTimes(1);
      expect(mockClearCart).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/tracking?id=123');
    });
  });

  it('successful submit clears cart', async () => {
    const user = userEvent.setup();
    render(<CheckoutForm />);
    await user.type(screen.getByPlaceholderText('+370 600 00000'), '+37060000000');
    await user.click(screen.getByText('Pateikti užsakymą'));
    await waitFor(() => {
      expect(mockClearCart).toHaveBeenCalledTimes(1);
    });
  });
});
