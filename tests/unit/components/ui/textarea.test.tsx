import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea', () => {
  it('renders as textarea element', () => {
    render(<Textarea data-testid="textarea" />);
    expect(screen.getByTestId('textarea').tagName).toBe('TEXTAREA');
  });

  it('handles onChange', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(<Textarea onChange={handler} data-testid="textarea" />);
    await user.type(screen.getByTestId('textarea'), 'a');
    expect(handler).toHaveBeenCalled();
  });

  it('has disabled state', () => {
    render(<Textarea disabled data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toBeDisabled();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
