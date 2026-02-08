import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('renders as input element', () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId('input').tagName).toBe('INPUT');
  });

  it('accepts type prop', () => {
    render(<Input type="tel" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'tel');
  });

  it('accepts placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles onChange', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(<Input onChange={handler} data-testid="input" />);
    await user.type(screen.getByTestId('input'), 'a');
    expect(handler).toHaveBeenCalled();
  });

  it('has disabled state', () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('merges custom className', () => {
    render(<Input className="custom-class" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input.className).toContain('custom-class');
    expect(input.className).toContain('rounded-lg');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
