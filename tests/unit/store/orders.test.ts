import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Order } from '@/types';

// Mock @/services/orders to prevent Supabase calls
vi.mock('@/services/orders', () => ({
  submitOrderToSupabase: vi.fn(),
  fetchOrder: vi.fn(),
  fetchUserOrders: vi.fn(),
  fetchAllOrders: vi.fn(),
  updateOrderStatusInSupabase: vi.fn(),
}));

import { useOrderStore } from '@/store/orders';
import {
  submitOrderToSupabase,
  fetchOrder,
  fetchUserOrders,
  fetchAllOrders,
  updateOrderStatusInSupabase,
} from '@/services/orders';

const sampleCartItems = [
  {
    cart_key: 'prod-margarita',
    product_id: 'prod-margarita',
    product_name: 'Margarita',
    quantity: 2,
    base_price: 800,
    item_total: 1600,
  },
];

const sampleOrderParams = {
  items: sampleCartItems,
  fulfillmentType: 'pickup' as const,
  deliveryAddress: null,
  contactPhone: '+37060000000',
  notes: '',
  totalAmount: 1600,
};

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'uuid-001',
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
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

function resetStore() {
  useOrderStore.setState({ orders: [], loading: false, error: null });
}

describe('useOrderStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
    vi.clearAllMocks();
  });

  describe('submitOrder', () => {
    it('returns the order ID', async () => {
      vi.mocked(submitOrderToSupabase).mockResolvedValue(makeOrder());
      const id = await useOrderStore.getState().submitOrder(sampleOrderParams);
      expect(id).toBe('uuid-001');
    });

    it('calls submitOrderToSupabase with params', async () => {
      vi.mocked(submitOrderToSupabase).mockResolvedValue(makeOrder());
      await useOrderStore.getState().submitOrder(sampleOrderParams);
      expect(submitOrderToSupabase).toHaveBeenCalledWith(sampleOrderParams);
    });

    it('creates order with CREATED status', async () => {
      vi.mocked(submitOrderToSupabase).mockResolvedValue(makeOrder());
      await useOrderStore.getState().submitOrder(sampleOrderParams);
      const orders = useOrderStore.getState().orders;
      expect(orders[0].status).toBe('CREATED');
    });

    it('sets timestamps', async () => {
      vi.mocked(submitOrderToSupabase).mockResolvedValue(makeOrder());
      await useOrderStore.getState().submitOrder(sampleOrderParams);
      const order = useOrderStore.getState().orders[0];
      expect(new Date(order.created_at).getTime()).not.toBeNaN();
      expect(new Date(order.updated_at).getTime()).not.toBeNaN();
    });

    it('copies items correctly', async () => {
      vi.mocked(submitOrderToSupabase).mockResolvedValue(makeOrder());
      await useOrderStore.getState().submitOrder(sampleOrderParams);
      const order = useOrderStore.getState().orders[0];
      expect(order.items).toHaveLength(1);
      expect(order.items[0].product_name).toBe('Margarita');
      expect(order.items[0].quantity).toBe(2);
      expect(order.items[0].item_total).toBe(1600);
    });

    it('stores fulfillment type', async () => {
      vi.mocked(submitOrderToSupabase).mockResolvedValue(makeOrder());
      await useOrderStore.getState().submitOrder(sampleOrderParams);
      const order = useOrderStore.getState().orders[0];
      expect(order.fulfillment_type).toBe('pickup');
    });

    it('stores delivery address for delivery orders', async () => {
      const deliveryOrder = makeOrder({
        fulfillment_type: 'delivery',
        delivery_address: {
          street: 'Gedimino pr. 1',
          city: 'Vilnius',
          postal_code: 'LT-01103',
          notes: '',
        },
      });
      vi.mocked(submitOrderToSupabase).mockResolvedValue(deliveryOrder);
      await useOrderStore.getState().submitOrder({
        ...sampleOrderParams,
        fulfillmentType: 'delivery',
        deliveryAddress: {
          street: 'Gedimino pr. 1',
          city: 'Vilnius',
          postal_code: 'LT-01103',
          notes: '',
        },
      });
      const order = useOrderStore.getState().orders[0];
      expect(order.fulfillment_type).toBe('delivery');
      expect(order.delivery_address!.street).toBe('Gedimino pr. 1');
    });

    it('stores contact phone', async () => {
      vi.mocked(submitOrderToSupabase).mockResolvedValue(makeOrder());
      await useOrderStore.getState().submitOrder(sampleOrderParams);
      const order = useOrderStore.getState().orders[0];
      expect(order.contact_phone).toBe('+37060000000');
    });

    it('stores total amount', async () => {
      vi.mocked(submitOrderToSupabase).mockResolvedValue(makeOrder());
      await useOrderStore.getState().submitOrder(sampleOrderParams);
      const order = useOrderStore.getState().orders[0];
      expect(order.total_amount).toBe(1600);
    });

    it('prepends to orders array', async () => {
      const order1 = makeOrder({ id: 'uuid-001' });
      const order2 = makeOrder({ id: 'uuid-002' });
      vi.mocked(submitOrderToSupabase).mockResolvedValueOnce(order1);
      await useOrderStore.getState().submitOrder(sampleOrderParams);
      vi.mocked(submitOrderToSupabase).mockResolvedValueOnce(order2);
      await useOrderStore.getState().submitOrder(sampleOrderParams);
      const orders = useOrderStore.getState().orders;
      expect(orders[0].id).toBe('uuid-002');
      expect(orders[1].id).toBe('uuid-001');
    });

    it('sets error on failure', async () => {
      vi.mocked(submitOrderToSupabase).mockRejectedValue(new Error('Network error'));
      await expect(
        useOrderStore.getState().submitOrder(sampleOrderParams)
      ).rejects.toThrow('Network error');
      expect(useOrderStore.getState().error).toBe('Network error');
    });
  });

  describe('getOrder', () => {
    it('finds cached order', async () => {
      useOrderStore.setState({ orders: [makeOrder({ id: 'uuid-001' })] });
      const order = await useOrderStore.getState().getOrder('uuid-001');
      expect(order).not.toBeNull();
      expect(order!.id).toBe('uuid-001');
      expect(fetchOrder).not.toHaveBeenCalled();
    });

    it('fetches from Supabase if not cached', async () => {
      const order = makeOrder({ id: 'uuid-002' });
      vi.mocked(fetchOrder).mockResolvedValue(order);
      const result = await useOrderStore.getState().getOrder('uuid-002');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('uuid-002');
      expect(fetchOrder).toHaveBeenCalledWith('uuid-002');
    });

    it('returns null for missing order', async () => {
      vi.mocked(fetchOrder).mockResolvedValue(null);
      const result = await useOrderStore.getState().getOrder('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('loadUserOrders', () => {
    it('loads orders from Supabase', async () => {
      const orders = [makeOrder({ id: 'uuid-001' }), makeOrder({ id: 'uuid-002' })];
      vi.mocked(fetchUserOrders).mockResolvedValue(orders);
      await useOrderStore.getState().loadUserOrders();
      expect(useOrderStore.getState().orders).toHaveLength(2);
    });

    it('replaces existing orders', async () => {
      useOrderStore.setState({ orders: [makeOrder({ id: 'old' })] });
      vi.mocked(fetchUserOrders).mockResolvedValue([makeOrder({ id: 'new' })]);
      await useOrderStore.getState().loadUserOrders();
      expect(useOrderStore.getState().orders).toHaveLength(1);
      expect(useOrderStore.getState().orders[0].id).toBe('new');
    });
  });

  describe('loadAllOrders', () => {
    it('loads all orders from Supabase', async () => {
      const orders = [
        makeOrder({ id: 'uuid-001' }),
        makeOrder({ id: 'uuid-002' }),
        makeOrder({ id: 'uuid-003' }),
      ];
      vi.mocked(fetchAllOrders).mockResolvedValue(orders);
      await useOrderStore.getState().loadAllOrders();
      expect(useOrderStore.getState().orders).toHaveLength(3);
    });
  });

  describe('getActiveOrders', () => {
    it('includes CREATED, ACCEPTED, PREPARING, READY', () => {
      useOrderStore.setState({
        orders: [
          makeOrder({ id: '1', status: 'CREATED', created_at: '2026-01-01T01:00:00Z' }),
          makeOrder({ id: '2', status: 'ACCEPTED', created_at: '2026-01-01T02:00:00Z' }),
          makeOrder({ id: '3', status: 'PREPARING', created_at: '2026-01-01T03:00:00Z' }),
          makeOrder({ id: '4', status: 'READY', created_at: '2026-01-01T04:00:00Z' }),
        ],
      });
      const active = useOrderStore.getState().getActiveOrders();
      expect(active).toHaveLength(4);
    });

    it('excludes COMPLETED', () => {
      useOrderStore.setState({ orders: [makeOrder({ status: 'COMPLETED' })] });
      expect(useOrderStore.getState().getActiveOrders()).toHaveLength(0);
    });

    it('excludes CANCELLED', () => {
      useOrderStore.setState({ orders: [makeOrder({ status: 'CANCELLED' })] });
      expect(useOrderStore.getState().getActiveOrders()).toHaveLength(0);
    });

    it('sorted oldest first', () => {
      useOrderStore.setState({
        orders: [
          makeOrder({ id: 'newer', created_at: '2026-02-01T00:00:00Z' }),
          makeOrder({ id: 'older', created_at: '2026-01-01T00:00:00Z' }),
        ],
      });
      const active = useOrderStore.getState().getActiveOrders();
      expect(active[0].id).toBe('older');
      expect(active[1].id).toBe('newer');
    });
  });

  describe('updateOrderStatus', () => {
    it('updates status', async () => {
      useOrderStore.setState({ orders: [makeOrder({ id: 'uuid-001' })] });
      vi.mocked(updateOrderStatusInSupabase).mockResolvedValue(undefined);
      await useOrderStore.getState().updateOrderStatus('uuid-001', 'ACCEPTED');
      const order = useOrderStore.getState().orders.find((o) => o.id === 'uuid-001');
      expect(order!.status).toBe('ACCEPTED');
    });

    it('calls updateOrderStatusInSupabase', async () => {
      useOrderStore.setState({ orders: [makeOrder({ id: 'uuid-001' })] });
      vi.mocked(updateOrderStatusInSupabase).mockResolvedValue(undefined);
      await useOrderStore.getState().updateOrderStatus('uuid-001', 'ACCEPTED');
      expect(updateOrderStatusInSupabase).toHaveBeenCalledWith('uuid-001', 'ACCEPTED');
    });

    it('updates updated_at', async () => {
      useOrderStore.setState({
        orders: [makeOrder({ id: 'uuid-001', updated_at: '2026-01-01T00:00:00Z' })],
      });
      vi.mocked(updateOrderStatusInSupabase).mockResolvedValue(undefined);
      await useOrderStore.getState().updateOrderStatus('uuid-001', 'ACCEPTED');
      const order = useOrderStore.getState().orders.find((o) => o.id === 'uuid-001');
      expect(new Date(order!.updated_at).getTime()).toBeGreaterThan(
        new Date('2026-01-01T00:00:00Z').getTime()
      );
    });

    it('supports full lifecycle', async () => {
      useOrderStore.setState({ orders: [makeOrder({ id: 'uuid-001' })] });
      vi.mocked(updateOrderStatusInSupabase).mockResolvedValue(undefined);
      const statuses = ['ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'] as const;
      for (const status of statuses) {
        await useOrderStore.getState().updateOrderStatus('uuid-001', status);
        const order = useOrderStore.getState().orders.find((o) => o.id === 'uuid-001');
        expect(order!.status).toBe(status);
      }
    });
  });
});
