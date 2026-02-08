import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Loader } from '@/components/shared/loader';

describe('Loader', () => {
  it('renders spinner with animate-spin class', () => {
    const { container } = render(<Loader />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.classList.contains('animate-spin')).toBe(true);
  });

  it('accepts custom className', () => {
    const { container } = render(<Loader className="custom-class" />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });
});
