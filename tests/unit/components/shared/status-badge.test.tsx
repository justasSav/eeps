import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/shared/status-badge';

describe('StatusBadge', () => {
  it('CREATED → "Pateiktas"', () => {
    render(<StatusBadge status="CREATED" />);
    const badge = screen.getByText('Pateiktas');
    expect(badge.className).toContain('bg-gray-100');
    expect(badge.className).toContain('text-gray-800');
  });

  it('ACCEPTED → "Priimtas"', () => {
    render(<StatusBadge status="ACCEPTED" />);
    const badge = screen.getByText('Priimtas');
    expect(badge.className).toContain('bg-blue-100');
    expect(badge.className).toContain('text-blue-800');
  });

  it('PREPARING → "Ruošiamas"', () => {
    render(<StatusBadge status="PREPARING" />);
    const badge = screen.getByText('Ruošiamas');
    expect(badge.className).toContain('bg-yellow-100');
    expect(badge.className).toContain('text-yellow-800');
  });

  it('READY → "Paruoštas"', () => {
    render(<StatusBadge status="READY" />);
    const badge = screen.getByText('Paruoštas');
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-800');
  });

  it('COMPLETED → "Įvykdytas"', () => {
    render(<StatusBadge status="COMPLETED" />);
    const badge = screen.getByText('Įvykdytas');
    expect(badge.className).toContain('bg-gray-100');
    expect(badge.className).toContain('text-gray-600');
  });

  it('CANCELLED → "Atšauktas"', () => {
    render(<StatusBadge status="CANCELLED" />);
    const badge = screen.getByText('Atšauktas');
    expect(badge.className).toContain('bg-red-100');
    expect(badge.className).toContain('text-red-800');
  });
});
