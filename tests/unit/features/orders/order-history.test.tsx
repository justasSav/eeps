import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Order } from '@/types';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock the order store — component now uses useOrderStore((s) => s.orders)
const mockOrders = vi.fn<() => Order[]>().mockReturnValue([]);
vi.mock('@/store/orders', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/orders')>();
  return {
    ...actual,
    useOrderStore: (selector: (state: unknown) => unknown) => {
      const mockState = {
        orders: mockOrders(),
      };
      return selector(mockState);
    },
  };
});

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: String(Math.floor(100 + Math.random() * 900)),
    fulfillment_type: 'pickup',
    status: 'CREATED',
    delivery_address: null,
    contact_phone: '+37060000000',
    items: [
      {
        product_id: 'prod-margarita',
        product_name: 'Margarita',
        quantity: 2,
        base_price: 800,
        item_total: 1600,
      },
    ],
    total_amount: 1600,
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

let OrderHistory: typeof import('@/features/orders/order-history').OrderHistory;

beforeEach(async () => {
  const mod = await import('@/features/orders/order-history');
  OrderHistory = mod.OrderHistory;
  mockOrders.mockReturnValue([]);
});

describe('OrderHistory', () => {
  it('empty state when no orders', () => {
    render(<OrderHistory />);
    expect(screen.getByText('Užsakymų dar nėra')).toBeInTheDocument();
  });

  it('browse menu button in empty state', () => {
    render(<OrderHistory />);
    const browseLink = screen.getByText('Naršyti meniu').closest('a');
    expect(browseLink).toHaveAttribute('href', '/');
  });

  it('renders order cards', () => {
    const order = makeOrder({ id: '123' });
    mockOrders.mockReturnValue([order]);
    render(<OrderHistory />);
    expect(screen.getByText('Užsakymas #123')).toBeInTheDocument();
    expect(screen.getByText('Pateiktas')).toBeInTheDocument();
  });

  it('order card links to tracking', () => {
    const order = makeOrder({ id: '456' });
    mockOrders.mockReturnValue([order]);
    render(<OrderHistory />);
    const link = screen.getByText('Užsakymas #456').closest('a');
    expect(link).toHaveAttribute('href', '/tracking?id=456');
  });

  it('orders sorted newest first', () => {
    const order1 = makeOrder({ id: '100', created_at: '2026-01-01T00:00:00Z' });
    const order2 = makeOrder({ id: '200', created_at: '2026-02-01T00:00:00Z' });
    // Component sorts via useMemo, so provide unsorted
    mockOrders.mockReturnValue([order1, order2]);
    render(<OrderHistory />);
    const orderLabels = screen.getAllByText(/Užsakymas #\d+/);
    expect(orderLabels).toHaveLength(2);
    // Newest first after sort
    expect(orderLabels[0].textContent).toContain('200');
  });

  it('item count with correct pluralization - singular', () => {
    const order = makeOrder({ id: '100' });
    mockOrders.mockReturnValue([order]);
    render(<OrderHistory />);
    expect(screen.getByText('1 prekė')).toBeInTheDocument();
  });

  it('item count pluralization for multiple items', () => {
    const order = makeOrder({
      id: '100',
      items: [
        { product_id: 'p1', product_name: 'A', quantity: 1, base_price: 100, item_total: 100 },
        { product_id: 'p2', product_name: 'B', quantity: 1, base_price: 200, item_total: 200 },
      ],
    });
    mockOrders.mockReturnValue([order]);
    render(<OrderHistory />);
    expect(screen.getByText('2 prekės')).toBeInTheDocument();
  });

  it('shows total amount', () => {
    const order = makeOrder({ id: '100', total_amount: 1600 });
    mockOrders.mockReturnValue([order]);
    render(<OrderHistory />);
    expect(screen.getByText('€16.00')).toBeInTheDocument();
  });
});
