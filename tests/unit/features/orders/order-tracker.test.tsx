import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { Order } from '@/types';

// Mock services to prevent Supabase calls
vi.mock('@/services/orders', () => ({
  submitOrderToSupabase: vi.fn(),
  fetchOrder: vi.fn().mockResolvedValue(null),
  fetchUserOrders: vi.fn().mockResolvedValue([]),
  fetchAllOrders: vi.fn().mockResolvedValue([]),
  updateOrderStatusInSupabase: vi.fn().mockResolvedValue(undefined),
}));

import { OrderTracker } from '@/features/orders/order-tracker';
import { useOrderStore } from '@/store/orders';

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'abcd1234-0000-0000-0000-000000000001',
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

describe('OrderTracker', () => {
  beforeEach(() => {
    useOrderStore.setState({ orders: [], loading: false, error: null });
  });

  it('not found state', async () => {
    render(<OrderTracker orderId="nonexistent" />);
    expect(await screen.findByText('Užsakymas nerastas.')).toBeInTheDocument();
  });

  it('shows order ID in header', async () => {
    const order = makeOrder();
    useOrderStore.setState({ orders: [order] });
    render(<OrderTracker orderId={order.id} />);
    // Component shows order.id.slice(0, 8) = 'abcd1234'
    expect(await screen.findByText('Užsakymas #abcd1234')).toBeInTheDocument();
  });

  it('renders 5-step progress stepper', async () => {
    const order = makeOrder();
    useOrderStore.setState({ orders: [order] });
    render(<OrderTracker orderId={order.id} />);
    expect(await screen.findByText('Užsakymas pateiktas')).toBeInTheDocument();
    expect(screen.getByText('Užsakymas priimtas')).toBeInTheDocument();
    expect(screen.getByText('Ruošiamas')).toBeInTheDocument();
    expect(screen.getByText('Paruoštas')).toBeInTheDocument();
    expect(screen.getByText('Įvykdytas')).toBeInTheDocument();
  });

  it('completed steps have checkmark (SVG icon)', async () => {
    const order = makeOrder({ status: 'PREPARING' });
    useOrderStore.setState({ orders: [order] });
    const { container } = render(<OrderTracker orderId={order.id} />);
    // Wait for async getOrder to resolve and component to render
    await waitFor(() => {
      // Steps 0 (CREATED), 1 (ACCEPTED), 2 (PREPARING) should be completed
      const completedCircles = container.querySelectorAll('.bg-orange-600');
      expect(completedCircles.length).toBe(3);
    });
  });

  it('current step highlighted orange', async () => {
    const order = makeOrder();
    useOrderStore.setState({ orders: [order] });
    render(<OrderTracker orderId={order.id} />);
    const currentLabel = await screen.findByText('Užsakymas pateiktas');
    expect(currentLabel.className).toContain('text-orange-600');
    expect(currentLabel.className).toContain('font-semibold');
  });

  it('future steps are gray', async () => {
    const order = makeOrder();
    useOrderStore.setState({ orders: [order] });
    render(<OrderTracker orderId={order.id} />);
    await screen.findByText('Užsakymas pateiktas');
    const futureLabel = screen.getByText('Užsakymas priimtas');
    expect(futureLabel.className).toContain('text-gray-400');
  });

  it('CANCELLED shows red alert', async () => {
    const order = makeOrder({ status: 'CANCELLED' });
    useOrderStore.setState({ orders: [order] });
    render(<OrderTracker orderId={order.id} />);
    expect(await screen.findByText('Šis užsakymas buvo atšauktas.')).toBeInTheDocument();
  });

  it('CANCELLED hides stepper', async () => {
    const order = makeOrder({ status: 'CANCELLED' });
    useOrderStore.setState({ orders: [order] });
    render(<OrderTracker orderId={order.id} />);
    await screen.findByText('Šis užsakymas buvo atšauktas.');
    expect(screen.queryByText('Užsakymas pateiktas')).toBeNull();
  });

  it('shows fulfillment type - pickup', async () => {
    const order = makeOrder();
    useOrderStore.setState({ orders: [order] });
    render(<OrderTracker orderId={order.id} />);
    expect(await screen.findByText('Atsiėmimas')).toBeInTheDocument();
  });

  it('shows fulfillment type - delivery', async () => {
    const order = makeOrder({
      fulfillment_type: 'delivery',
      delivery_address: {
        street: 'Gedimino pr. 1',
        city: 'Vilnius',
        postal_code: 'LT-01103',
        notes: '',
      },
    });
    useOrderStore.setState({ orders: [order] });
    render(<OrderTracker orderId={order.id} />);
    expect(await screen.findByText('Pristatymas')).toBeInTheDocument();
  });

  it('shows phone', async () => {
    const order = makeOrder();
    useOrderStore.setState({ orders: [order] });
    render(<OrderTracker orderId={order.id} />);
    expect(await screen.findByText('+37060000000')).toBeInTheDocument();
  });

  it('shows address for delivery', async () => {
    const order = makeOrder({
      fulfillment_type: 'delivery',
      delivery_address: {
        street: 'Gedimino pr. 1',
        city: 'Vilnius',
        postal_code: 'LT-01103',
        notes: '',
      },
    });
    useOrderStore.setState({ orders: [order] });
    render(<OrderTracker orderId={order.id} />);
    expect(await screen.findByText(/Gedimino pr\. 1/)).toBeInTheDocument();
    expect(screen.getByText(/Vilnius/)).toBeInTheDocument();
  });

  it('hides address for pickup', async () => {
    const order = makeOrder();
    useOrderStore.setState({ orders: [order] });
    render(<OrderTracker orderId={order.id} />);
    await screen.findByText('Atsiėmimas');
    expect(screen.queryByText('Adresas:')).toBeNull();
  });

  it('shows items with quantities', async () => {
    const order = makeOrder();
    useOrderStore.setState({ orders: [order] });
    render(<OrderTracker orderId={order.id} />);
    expect(await screen.findByText('2x Margarita')).toBeInTheDocument();
  });

  it('shows total', async () => {
    const order = makeOrder();
    useOrderStore.setState({ orders: [order] });
    render(<OrderTracker orderId={order.id} />);
    await screen.findByText('2x Margarita');
    const priceElements = screen.getAllByText('€16.00');
    expect(priceElements.length).toBeGreaterThanOrEqual(1);
  });
});
