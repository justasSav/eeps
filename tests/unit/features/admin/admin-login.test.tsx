import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockLogin = vi.fn<(username: string, password: string) => boolean>().mockReturnValue(false);

vi.mock('@/store/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/auth')>();
  return {
    ...actual,
    useAuthStore: (selector: (state: unknown) => unknown) => {
      const mockState = {
        login: mockLogin,
      };
      return selector(mockState);
    },
  };
});

let AdminLogin: typeof import('@/features/admin/admin-login').AdminLogin;

beforeEach(async () => {
  const mod = await import('@/features/admin/admin-login');
  AdminLogin = mod.AdminLogin;
  mockLogin.mockReset().mockReturnValue(false);
});

describe('AdminLogin', () => {
  it('renders login heading', () => {
    render(<AdminLogin />);
    expect(screen.getByText('Administratoriaus prisijungimas')).toBeInTheDocument();
  });

  it('renders username input', () => {
    render(<AdminLogin />);
    expect(screen.getByLabelText('Prisijungimo vardas')).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(<AdminLogin />);
    expect(screen.getByLabelText('Slaptažodis')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<AdminLogin />);
    expect(screen.getByRole('button', { name: 'Prisijungti' })).toBeInTheDocument();
  });

  it('shows error for empty fields', async () => {
    const user = userEvent.setup();
    render(<AdminLogin />);
    await user.click(screen.getByRole('button', { name: 'Prisijungti' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Įveskite prisijungimo vardą ir slaptažodį.'
    );
  });

  it('shows error for empty username', async () => {
    const user = userEvent.setup();
    render(<AdminLogin />);
    await user.type(screen.getByLabelText('Slaptažodis'), 'demo');
    await user.click(screen.getByRole('button', { name: 'Prisijungti' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Įveskite prisijungimo vardą ir slaptažodį.'
    );
  });

  it('shows error for empty password', async () => {
    const user = userEvent.setup();
    render(<AdminLogin />);
    await user.type(screen.getByLabelText('Prisijungimo vardas'), 'demo');
    await user.click(screen.getByRole('button', { name: 'Prisijungti' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Įveskite prisijungimo vardą ir slaptažodį.'
    );
  });

  it('calls login with entered credentials', async () => {
    const user = userEvent.setup();
    render(<AdminLogin />);
    await user.type(screen.getByLabelText('Prisijungimo vardas'), 'demo');
    await user.type(screen.getByLabelText('Slaptažodis'), 'demo');
    await user.click(screen.getByRole('button', { name: 'Prisijungti' }));
    expect(mockLogin).toHaveBeenCalledWith('demo', 'demo');
  });

  it('shows error on failed login', async () => {
    mockLogin.mockReturnValue(false);
    const user = userEvent.setup();
    render(<AdminLogin />);
    await user.type(screen.getByLabelText('Prisijungimo vardas'), 'wrong');
    await user.type(screen.getByLabelText('Slaptažodis'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Prisijungti' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Neteisingas prisijungimo vardas arba slaptažodis.'
    );
  });

  it('does not show error on successful login', async () => {
    mockLogin.mockReturnValue(true);
    const user = userEvent.setup();
    render(<AdminLogin />);
    await user.type(screen.getByLabelText('Prisijungimo vardas'), 'demo');
    await user.type(screen.getByLabelText('Slaptažodis'), 'demo');
    await user.click(screen.getByRole('button', { name: 'Prisijungti' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('trims whitespace from username', async () => {
    const user = userEvent.setup();
    render(<AdminLogin />);
    await user.type(screen.getByLabelText('Prisijungimo vardas'), '  demo  ');
    await user.type(screen.getByLabelText('Slaptažodis'), 'demo');
    await user.click(screen.getByRole('button', { name: 'Prisijungti' }));
    expect(mockLogin).toHaveBeenCalledWith('demo', 'demo');
  });

  it('password input has type password', () => {
    render(<AdminLogin />);
    expect(screen.getByLabelText('Slaptažodis')).toHaveAttribute('type', 'password');
  });
});
