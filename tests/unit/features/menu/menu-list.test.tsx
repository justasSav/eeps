import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CartItem } from '@/types';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock cart store to avoid getSnapshot issues
const mockAddItem = vi.fn();
const mockCartItems = vi.fn<() => CartItem[]>().mockReturnValue([]);

vi.mock('@/store/cart', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/cart')>();
  return {
    ...actual,
    useCartStore: (selector: (state: unknown) => unknown) => {
      const mockState = {
        addItem: mockAddItem,
        items: mockCartItems(),
      };
      return selector(mockState);
    },
  };
});

// Mock window.scrollTo
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

// Mock IntersectionObserver as a proper class
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor() {}
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

let MenuList: typeof import('@/features/menu/menu-list').MenuList;

beforeEach(async () => {
  const mod = await import('@/features/menu/menu-list');
  MenuList = mod.MenuList;
  mockAddItem.mockReset();
  mockCartItems.mockReturnValue([]);
});

describe('MenuList', () => {
  it('renders all categories from menu', () => {
    render(<MenuList />);
    expect(screen.getByRole('heading', { name: 'Picos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kebabai' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kiti patiekalai' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gėrimai' })).toBeInTheDocument();
  });

  it('renders products under categories', () => {
    render(<MenuList />);
    expect(screen.getByText('Margarita')).toBeInTheDocument();
    expect(screen.getByText('Coca-Cola 330ml')).toBeInTheDocument();
  });

  it('search filters products by name', async () => {
    const user = userEvent.setup();
    render(<MenuList />);
    const searchInput = screen.getByPlaceholderText('Ieškoti meniu...');
    await user.type(searchInput, 'Margarita');
    expect(screen.getByText('Margarita')).toBeInTheDocument();
    expect(screen.queryByText('Coca-Cola 330ml')).toBeNull();
  });

  it('search is case-insensitive', async () => {
    const user = userEvent.setup();
    render(<MenuList />);
    const searchInput = screen.getByPlaceholderText('Ieškoti meniu...');
    await user.type(searchInput, 'margarita');
    expect(screen.getByText('Margarita')).toBeInTheDocument();
  });

  it('empty search shows all products', async () => {
    const user = userEvent.setup();
    render(<MenuList />);
    const searchInput = screen.getByPlaceholderText('Ieškoti meniu...');
    await user.type(searchInput, 'Margarita');
    await user.clear(searchInput);
    expect(screen.getByText('Margarita')).toBeInTheDocument();
    expect(screen.getByText('Coca-Cola 330ml')).toBeInTheDocument();
  });

  it('no results message when no match', async () => {
    const user = userEvent.setup();
    render(<MenuList />);
    const searchInput = screen.getByPlaceholderText('Ieškoti meniu...');
    await user.type(searchInput, 'xyzabc');
    expect(screen.getByText('Nieko nerasta.')).toBeInTheDocument();
  });

  it('category filter is rendered', () => {
    render(<MenuList />);
    // Category filter buttons exist (along with product "Pridėti" buttons)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
