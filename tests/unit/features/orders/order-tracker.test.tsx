import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderTracker } from '@/features/orders/order-tracker';
import { useOrderStore } from '@/store/orders';

const sampleOrderParams = {
  items: [
    {
      cart_key: 'prod-margarita',
      product_id: 'prod-margarita',
      product_name: 'Margarita',
      quantity: 2,
      base_price: 800,
      item_total: 1600,
    },
  ],
  fulfillmentType: 'pickup' as const,
  deliveryAddress: null,
  contactPhone: '+37060000000',
  notes: '',
  totalAmount: 1600,
};

describe('OrderTracker', () => {
  beforeEach(() => {
    localStorage.clear();
    useOrderStore.setState({ orders: [] });
  });

  it('not found state', () => {
    render(<OrderTracker orderId="000" />);
    expect(screen.getByText('Užsakymas nerastas.')).toBeInTheDocument();
  });

  it('shows order ID in header', () => {
    const code = useOrderStore.getState().submitOrder(sampleOrderParams);
    render(<OrderTracker orderId={code} />);
    expect(screen.getByText(`Užsakymas #${code}`)).toBeInTheDocument();
  });

  it('renders 5-step progress stepper', () => {
    const code = useOrderStore.getState().submitOrder(sampleOrderParams);
    render(<OrderTracker orderId={code} />);
    expect(screen.getByText('Užsakymas pateiktas')).toBeInTheDocument();
    expect(screen.getByText('Užsakymas priimtas')).toBeInTheDocument();
    expect(screen.getByText('Ruošiamas')).toBeInTheDocument();
    expect(screen.getByText('Paruoštas')).toBeInTheDocument();
    expect(screen.getByText('Įvykdytas')).toBeInTheDocument();
  });

  it('completed steps have checkmark (SVG icon)', () => {
    const code = useOrderStore.getState().submitOrder(sampleOrderParams);
    useOrderStore.getState().updateOrderStatus(code, 'PREPARING');
    const { container } = render(<OrderTracker orderId={code} />);
    // Steps 0 (CREATED), 1 (ACCEPTED), 2 (PREPARING) should be completed
    const completedCircles = container.querySelectorAll('.bg-orange-600');
    expect(completedCircles.length).toBe(3);
  });

  it('current step highlighted orange', () => {
    const code = useOrderStore.getState().submitOrder(sampleOrderParams);
    render(<OrderTracker orderId={code} />);
    const currentLabel = screen.getByText('Užsakymas pateiktas');
    expect(currentLabel.className).toContain('text-orange-600');
    expect(currentLabel.className).toContain('font-semibold');
  });

  it('future steps are gray', () => {
    const code = useOrderStore.getState().submitOrder(sampleOrderParams);
    render(<OrderTracker orderId={code} />);
    const futureLabel = screen.getByText('Užsakymas priimtas');
    expect(futureLabel.className).toContain('text-gray-400');
  });

  it('CANCELLED shows red alert', () => {
    const code = useOrderStore.getState().submitOrder(sampleOrderParams);
    useOrderStore.getState().updateOrderStatus(code, 'CANCELLED');
    render(<OrderTracker orderId={code} />);
    expect(screen.getByText('Šis užsakymas buvo atšauktas.')).toBeInTheDocument();
  });

  it('CANCELLED hides stepper', () => {
    const code = useOrderStore.getState().submitOrder(sampleOrderParams);
    useOrderStore.getState().updateOrderStatus(code, 'CANCELLED');
    render(<OrderTracker orderId={code} />);
    expect(screen.queryByText('Užsakymas pateiktas')).toBeNull();
  });

  it('shows fulfillment type - pickup', () => {
    const code = useOrderStore.getState().submitOrder(sampleOrderParams);
    render(<OrderTracker orderId={code} />);
    expect(screen.getByText('Atsiėmimas')).toBeInTheDocument();
  });

  it('shows fulfillment type - delivery', () => {
    const code = useOrderStore.getState().submitOrder({
      ...sampleOrderParams,
      fulfillmentType: 'delivery',
      deliveryAddress: {
        street: 'Gedimino pr. 1',
        city: 'Vilnius',
        postal_code: 'LT-01103',
        notes: '',
      },
    });
    render(<OrderTracker orderId={code} />);
    expect(screen.getByText('Pristatymas')).toBeInTheDocument();
  });

  it('shows phone', () => {
    const code = useOrderStore.getState().submitOrder(sampleOrderParams);
    render(<OrderTracker orderId={code} />);
    expect(screen.getByText('+37060000000')).toBeInTheDocument();
  });

  it('shows address for delivery', () => {
    const code = useOrderStore.getState().submitOrder({
      ...sampleOrderParams,
      fulfillmentType: 'delivery',
      deliveryAddress: {
        street: 'Gedimino pr. 1',
        city: 'Vilnius',
        postal_code: 'LT-01103',
        notes: '',
      },
    });
    render(<OrderTracker orderId={code} />);
    expect(screen.getByText(/Gedimino pr\. 1/)).toBeInTheDocument();
    expect(screen.getByText(/Vilnius/)).toBeInTheDocument();
  });

  it('hides address for pickup', () => {
    const code = useOrderStore.getState().submitOrder(sampleOrderParams);
    render(<OrderTracker orderId={code} />);
    expect(screen.queryByText('Adresas:')).toBeNull();
  });

  it('shows items with quantities', () => {
    const code = useOrderStore.getState().submitOrder(sampleOrderParams);
    render(<OrderTracker orderId={code} />);
    expect(screen.getByText('2x Margarita')).toBeInTheDocument();
  });

  it('shows total', () => {
    const code = useOrderStore.getState().submitOrder(sampleOrderParams);
    render(<OrderTracker orderId={code} />);
    // Both item_total and total_amount are €16.00, so use getAllByText
    const priceElements = screen.getAllByText('€16.00');
    expect(priceElements.length).toBeGreaterThanOrEqual(1);
  });
});
