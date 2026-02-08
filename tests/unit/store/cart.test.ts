import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/store/cart';

function resetStore() {
  useCartStore.setState({
    items: [],
    fulfillment_type: 'pickup',
    delivery_address: null,
    contact_phone: '',
    notes: '',
  });
}

const sampleItem = {
  product_id: 'prod-margarita',
  product_name: 'Margarita',
  base_price: 800,
  item_total: 800,
};

const sampleItem2 = {
  product_id: 'prod-havaju',
  product_name: 'Havajų',
  base_price: 900,
  item_total: 900,
};

describe('useCartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  describe('addItem', () => {
    it('adds new item with qty=1', () => {
      useCartStore.getState().addItem(sampleItem);
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(1);
    });

    it('deduplicates same product', () => {
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().addItem(sampleItem);
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it('calculates item_total', () => {
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().addItem(sampleItem);
      const { items } = useCartStore.getState();
      expect(items[0].item_total).toBe(1600);
    });

    it('keeps different products separate', () => {
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().addItem(sampleItem2);
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('removes item by cartKey', () => {
      useCartStore.getState().addItem(sampleItem);
      const key = useCartStore.getState().items[0].cart_key;
      useCartStore.getState().removeItem(key);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('non-existent key is no-op', () => {
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().removeItem('nonexistent');
      expect(useCartStore.getState().items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('updates quantity', () => {
      useCartStore.getState().addItem(sampleItem);
      const key = useCartStore.getState().items[0].cart_key;
      useCartStore.getState().updateQuantity(key, 5);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('recalculates item_total', () => {
      useCartStore.getState().addItem(sampleItem);
      const key = useCartStore.getState().items[0].cart_key;
      useCartStore.getState().updateQuantity(key, 3);
      expect(useCartStore.getState().items[0].item_total).toBe(2400);
    });

    it('qty 0 removes item', () => {
      useCartStore.getState().addItem(sampleItem);
      const key = useCartStore.getState().items[0].cart_key;
      useCartStore.getState().updateQuantity(key, 0);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('negative qty removes item', () => {
      useCartStore.getState().addItem(sampleItem);
      const key = useCartStore.getState().items[0].cart_key;
      useCartStore.getState().updateQuantity(key, -1);
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('removes all items', () => {
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().addItem(sampleItem2);
      useCartStore.getState().clearCart();
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('resets fulfillment_type to pickup', () => {
      useCartStore.getState().setFulfillmentType('delivery');
      useCartStore.getState().clearCart();
      expect(useCartStore.getState().fulfillment_type).toBe('pickup');
    });

    it('resets delivery_address to null', () => {
      useCartStore.getState().setDeliveryAddress({
        street: 'Test St',
        city: 'Test City',
        postal_code: '12345',
        notes: '',
      });
      useCartStore.getState().clearCart();
      expect(useCartStore.getState().delivery_address).toBeNull();
    });

    it('resets contact_phone to empty', () => {
      useCartStore.getState().setContactPhone('+37060000000');
      useCartStore.getState().clearCart();
      expect(useCartStore.getState().contact_phone).toBe('');
    });

    it('resets notes to empty', () => {
      useCartStore.getState().setNotes('no onions');
      useCartStore.getState().clearCart();
      expect(useCartStore.getState().notes).toBe('');
    });
  });

  describe('getTotal', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().getTotal()).toBe(0);
    });

    it('calculates single item total', () => {
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().addItem(sampleItem);
      expect(useCartStore.getState().getTotal()).toBe(1600);
    });

    it('calculates multiple items total', () => {
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().addItem(sampleItem2);
      expect(useCartStore.getState().getTotal()).toBe(1700);
    });
  });

  describe('getItemCount', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().getItemCount()).toBe(0);
    });

    it('sums quantities', () => {
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().addItem(sampleItem);
      useCartStore.getState().addItem(sampleItem2);
      useCartStore.getState().updateQuantity('prod-havaju', 3);
      expect(useCartStore.getState().getItemCount()).toBe(5);
    });
  });

  describe('setters', () => {
    it('setFulfillmentType', () => {
      useCartStore.getState().setFulfillmentType('delivery');
      expect(useCartStore.getState().fulfillment_type).toBe('delivery');
    });

    it('setDeliveryAddress', () => {
      const address = {
        street: 'Test St',
        city: 'Vilnius',
        postal_code: 'LT-01234',
        notes: 'Door 5',
      };
      useCartStore.getState().setDeliveryAddress(address);
      expect(useCartStore.getState().delivery_address).toEqual(address);
    });

    it('setContactPhone', () => {
      useCartStore.getState().setContactPhone('+37060000000');
      expect(useCartStore.getState().contact_phone).toBe('+37060000000');
    });

    it('setNotes', () => {
      useCartStore.getState().setNotes('no onions');
      expect(useCartStore.getState().notes).toBe('no onions');
    });
  });
});
