import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navbar } from '@/components/shared/navbar';
import { useCartStore } from '@/store/cart';
import { vi } from 'vitest';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

function resetCartStore() {
  useCartStore.setState({
    items: [],
    fulfillment_type: 'pickup',
    delivery_address: null,
    contact_phone: '',
    notes: '',
  });
}

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear();
    resetCartStore();
  });

  it('logo links to /', () => {
    render(<Navbar />);
    const logoLink = screen.getByText('EEPS').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('orders link points to /orders', () => {
    render(<Navbar />);
    const links = screen.getAllByRole('link');
    const ordersLink = links.find((link) => link.getAttribute('href') === '/orders');
    expect(ordersLink).toBeDefined();
  });

  it('admin link points to /admin', () => {
    render(<Navbar />);
    const links = screen.getAllByRole('link');
    const adminLink = links.find((link) => link.getAttribute('href') === '/admin');
    expect(adminLink).toBeDefined();
  });

  it('cart link points to /cart', () => {
    render(<Navbar />);
    const links = screen.getAllByRole('link');
    const cartLink = links.find((link) => link.getAttribute('href') === '/cart');
    expect(cartLink).toBeDefined();
  });

  it('badge hidden when cart empty', () => {
    render(<Navbar />);
    // No badge elements with numbers should appear
    const badge = screen.queryByText(/^\d+$/);
    expect(badge).toBeNull();
  });

  it('badge shows count', () => {
    useCartStore.getState().addItem({
      product_id: 'prod-margarita',
      product_name: 'Margarita',
      base_price: 800,
      item_total: 800,
    });
    useCartStore.getState().addItem({
      product_id: 'prod-margarita',
      product_name: 'Margarita',
      base_price: 800,
      item_total: 800,
    });
    useCartStore.getState().addItem({
      product_id: 'prod-havaju',
      product_name: 'Havajų',
      base_price: 900,
      item_total: 900,
    });
    render(<Navbar />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('badge updates on cart change', () => {
    useCartStore.getState().addItem({
      product_id: 'prod-margarita',
      product_name: 'Margarita',
      base_price: 800,
      item_total: 800,
    });
    render(<Navbar />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
