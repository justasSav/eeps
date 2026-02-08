import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilter } from '@/features/menu/category-filter';

const categories = [
  { id: 'cat-1', name: 'Picos' },
  { id: 'cat-2', name: 'Kebabai' },
  { id: 'cat-3', name: 'Mėsainiai' },
  { id: 'cat-4', name: 'Kiti patiekalai' },
  { id: 'cat-5', name: 'Gėrimai' },
];

describe('CategoryFilter', () => {
  it('renders pill for each category', () => {
    render(
      <CategoryFilter categories={categories} activeId={null} onSelect={vi.fn()} />
    );
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('active pill has orange styling', () => {
    render(
      <CategoryFilter categories={categories} activeId="cat-1" onSelect={vi.fn()} />
    );
    const activePill = screen.getByText('Picos');
    expect(activePill.className).toContain('bg-orange-600');
    expect(activePill.className).toContain('text-white');
  });

  it('inactive pill has gray styling', () => {
    render(
      <CategoryFilter categories={categories} activeId="cat-1" onSelect={vi.fn()} />
    );
    const inactivePill = screen.getByText('Kebabai');
    expect(inactivePill.className).toContain('bg-gray-100');
    expect(inactivePill.className).toContain('text-gray-700');
  });

  it('click calls onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <CategoryFilter categories={categories} activeId={null} onSelect={onSelect} />
    );
    await user.click(screen.getByText('Kebabai'));
    expect(onSelect).toHaveBeenCalledWith('cat-2');
  });

  it('handles empty categories', () => {
    const { container } = render(
      <CategoryFilter categories={[]} activeId={null} onSelect={vi.fn()} />
    );
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
