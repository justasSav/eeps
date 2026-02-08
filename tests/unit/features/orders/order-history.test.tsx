import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useOrderStore } from '@/store/orders';
import type { Order } from '@/types';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock the order store to avoid "getSnapshot should be cached" with getAllOrders()
const mockGetAllOrders = vi.fn<() => Order[]>().mockReturnValue([]);
vi.mock('@/store/orders', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/orders')>();
  return {
    ...actual,
    useOrderStore: (selector: (state: unknown) => unknown) => {
      // The component calls useOrderStore((s) => s.getAllOrders())
      // We intercept this to return our mock data
      const mockState = {
        getAllOrders: () => mockGetAllOrders(),
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

// Dynamic import so mock is applied before module loads
let OrderHistory: typeof import('@/features/orders/order-history').OrderHistory;

beforeEach(async () => {
  const mod = await import('@/features/orders/order-history');
  OrderHistory = mod.OrderHistory;
  mockGetAllOrders.mockReturnValue([]);
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
    mockGetAllOrders.mockReturnValue([order]);
    render(<OrderHistory />);
    expect(screen.getByText('Užsakymas #123')).toBeInTheDocument();
    expect(screen.getByText('Pateiktas')).toBeInTheDocument();
  });

  it('order card links to tracking', () => {
    const order = makeOrder({ id: '456' });
    mockGetAllOrders.mockReturnValue([order]);
    render(<OrderHistory />);
    const link = screen.getByText('Užsakymas #456').closest('a');
    expect(link).toHaveAttribute('href', '/tracking?id=456');
  });

  it('orders sorted newest first', () => {
    const order1 = makeOrder({ id: '100', created_at: '2026-01-01T00:00:00Z' });
    const order2 = makeOrder({ id: '200', created_at: '2026-02-01T00:00:00Z' });
    // Already sorted newest first (as getAllOrders returns)
    mockGetAllOrders.mockReturnValue([order2, order1]);
    render(<OrderHistory />);
    const orderLabels = screen.getAllByText(/Užsakymas #\d+/);
    expect(orderLabels).toHaveLength(2);
    expect(orderLabels[0].textContent).toContain('200');
  });

  it('item count with correct pluralization - singular', () => {
    const order = makeOrder({ id: '100' });
    mockGetAllOrders.mockReturnValue([order]);
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
    mockGetAllOrders.mockReturnValue([order]);
    render(<OrderHistory />);
    expect(screen.getByText('2 prekės')).toBeInTheDocument();
  });

  it('shows total amount', () => {
    const order = makeOrder({ id: '100', total_amount: 1600 });
    mockGetAllOrders.mockReturnValue([order]);
    render(<OrderHistory />);
    expect(screen.getByText('€16.00')).toBeInTheDocument();
  });
});
