import { describe, it, expect, beforeEach } from 'vitest';
import { useOrderStore } from '@/store/orders';

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

function resetStore() {
  useOrderStore.setState({ orders: [] });
}

describe('useOrderStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  describe('submitOrder', () => {
    it('returns a 3-digit code', () => {
      const code = useOrderStore.getState().submitOrder(sampleOrderParams);
      const num = parseInt(code, 10);
      expect(num).toBeGreaterThanOrEqual(100);
      expect(num).toBeLessThanOrEqual(999);
    });

    it('creates order with CREATED status', () => {
      const code = useOrderStore.getState().submitOrder(sampleOrderParams);
      const order = useOrderStore.getState().getOrder(code);
      expect(order).not.toBeNull();
      expect(order!.status).toBe('CREATED');
    });

    it('sets timestamps', () => {
      const code = useOrderStore.getState().submitOrder(sampleOrderParams);
      const order = useOrderStore.getState().getOrder(code)!;
      expect(new Date(order.created_at).getTime()).not.toBeNaN();
      expect(new Date(order.updated_at).getTime()).not.toBeNaN();
    });

    it('copies items correctly', () => {
      const code = useOrderStore.getState().submitOrder(sampleOrderParams);
      const order = useOrderStore.getState().getOrder(code)!;
      expect(order.items).toHaveLength(1);
      expect(order.items[0].product_name).toBe('Margarita');
      expect(order.items[0].quantity).toBe(2);
      expect(order.items[0].item_total).toBe(1600);
    });

    it('stores fulfillment type', () => {
      const code = useOrderStore.getState().submitOrder(sampleOrderParams);
      const order = useOrderStore.getState().getOrder(code)!;
      expect(order.fulfillment_type).toBe('pickup');
    });

    it('stores delivery address for delivery orders', () => {
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
      const order = useOrderStore.getState().getOrder(code)!;
      expect(order.fulfillment_type).toBe('delivery');
      expect(order.delivery_address!.street).toBe('Gedimino pr. 1');
    });

    it('stores contact phone', () => {
      const code = useOrderStore.getState().submitOrder(sampleOrderParams);
      const order = useOrderStore.getState().getOrder(code)!;
      expect(order.contact_phone).toBe('+37060000000');
    });

    it('stores total amount', () => {
      const code = useOrderStore.getState().submitOrder(sampleOrderParams);
      const order = useOrderStore.getState().getOrder(code)!;
      expect(order.total_amount).toBe(1600);
    });

    it('prepends to orders array', () => {
      const code1 = useOrderStore.getState().submitOrder(sampleOrderParams);
      const code2 = useOrderStore.getState().submitOrder(sampleOrderParams);
      const orders = useOrderStore.getState().orders;
      expect(orders[0].id).toBe(code2);
      expect(orders[1].id).toBe(code1);
    });

    it('generates unique codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 10; i++) {
        codes.add(useOrderStore.getState().submitOrder(sampleOrderParams));
      }
      expect(codes.size).toBe(10);
    });
  });

  describe('getOrder', () => {
    it('finds existing order', () => {
      const code = useOrderStore.getState().submitOrder(sampleOrderParams);
      const order = useOrderStore.getState().getOrder(code);
      expect(order).not.toBeNull();
      expect(order!.id).toBe(code);
    });

    it('returns null for missing', () => {
      expect(useOrderStore.getState().getOrder('000')).toBeNull();
    });
  });

  describe('getOrdersByPhone', () => {
    it('filters by phone', () => {
      useOrderStore.getState().submitOrder(sampleOrderParams);
      useOrderStore.getState().submitOrder(sampleOrderParams);
      useOrderStore.getState().submitOrder({
        ...sampleOrderParams,
        contactPhone: '+37061111111',
      });
      const result = useOrderStore.getState().getOrdersByPhone('+37060000000');
      expect(result).toHaveLength(2);
    });

    it('returns sorted newest first', () => {
      useOrderStore.getState().submitOrder(sampleOrderParams);
      useOrderStore.getState().submitOrder(sampleOrderParams);
      const result = useOrderStore.getState().getOrdersByPhone('+37060000000');
      expect(
        new Date(result[0].created_at).getTime()
      ).toBeGreaterThanOrEqual(new Date(result[1].created_at).getTime());
    });

    it('returns empty for unmatched phone', () => {
      useOrderStore.getState().submitOrder(sampleOrderParams);
      expect(useOrderStore.getState().getOrdersByPhone('999')).toHaveLength(0);
    });
  });

  describe('getAllOrders', () => {
    it('returns all orders', () => {
      useOrderStore.getState().submitOrder(sampleOrderParams);
      useOrderStore.getState().submitOrder(sampleOrderParams);
      useOrderStore.getState().submitOrder(sampleOrderParams);
      expect(useOrderStore.getState().getAllOrders()).toHaveLength(3);
    });

    it('sorted newest first', () => {
      useOrderStore.getState().submitOrder(sampleOrderParams);
      useOrderStore.getState().submitOrder(sampleOrderParams);
      const orders = useOrderStore.getState().getAllOrders();
      expect(
        new Date(orders[0].created_at).getTime()
      ).toBeGreaterThanOrEqual(new Date(orders[1].created_at).getTime());
    });
  });

  describe('getActiveOrders', () => {
    it('includes CREATED, ACCEPTED, PREPARING, READY', () => {
      const code1 = useOrderStore.getState().submitOrder(sampleOrderParams);
      const code2 = useOrderStore.getState().submitOrder(sampleOrderParams);
      const code3 = useOrderStore.getState().submitOrder(sampleOrderParams);
      const code4 = useOrderStore.getState().submitOrder(sampleOrderParams);
      useOrderStore.getState().updateOrderStatus(code2, 'ACCEPTED');
      useOrderStore.getState().updateOrderStatus(code3, 'PREPARING');
      useOrderStore.getState().updateOrderStatus(code4, 'READY');
      const active = useOrderStore.getState().getActiveOrders();
      expect(active).toHaveLength(4);
    });

    it('excludes COMPLETED', () => {
      const code = useOrderStore.getState().submitOrder(sampleOrderParams);
      useOrderStore.getState().updateOrderStatus(code, 'COMPLETED');
      expect(useOrderStore.getState().getActiveOrders()).toHaveLength(0);
    });

    it('excludes CANCELLED', () => {
      const code = useOrderStore.getState().submitOrder(sampleOrderParams);
      useOrderStore.getState().updateOrderStatus(code, 'CANCELLED');
      expect(useOrderStore.getState().getActiveOrders()).toHaveLength(0);
    });

    it('sorted oldest first', () => {
      useOrderStore.getState().submitOrder(sampleOrderParams);
      useOrderStore.getState().submitOrder(sampleOrderParams);
      const active = useOrderStore.getState().getActiveOrders();
      expect(
        new Date(active[0].created_at).getTime()
      ).toBeLessThanOrEqual(new Date(active[1].created_at).getTime());
    });
  });

  describe('updateOrderStatus', () => {
    it('updates status', () => {
      const code = useOrderStore.getState().submitOrder(sampleOrderParams);
      useOrderStore.getState().updateOrderStatus(code, 'ACCEPTED');
      expect(useOrderStore.getState().getOrder(code)!.status).toBe('ACCEPTED');
    });

    it('updates updated_at', () => {
      const code = useOrderStore.getState().submitOrder(sampleOrderParams);
      const before = useOrderStore.getState().getOrder(code)!.updated_at;
      useOrderStore.getState().updateOrderStatus(code, 'ACCEPTED');
      const after = useOrderStore.getState().getOrder(code)!.updated_at;
      expect(new Date(after).getTime()).toBeGreaterThanOrEqual(
        new Date(before).getTime()
      );
    });

    it('supports full lifecycle', () => {
      const code = useOrderStore.getState().submitOrder(sampleOrderParams);
      const statuses = ['ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'] as const;
      for (const status of statuses) {
        useOrderStore.getState().updateOrderStatus(code, status);
        expect(useOrderStore.getState().getOrder(code)!.status).toBe(status);
      }
    });
  });
});
