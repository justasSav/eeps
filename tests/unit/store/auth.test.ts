import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/auth';

function resetStore() {
  useAuthStore.setState({ isAuthenticated: false });
}

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  describe('initial state', () => {
    it('starts unauthenticated', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('returns true for correct credentials', () => {
      const result = useAuthStore.getState().login('demo', 'demo');
      expect(result).toBe(true);
    });

    it('sets isAuthenticated to true on success', () => {
      useAuthStore.getState().login('demo', 'demo');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('returns false for wrong username', () => {
      const result = useAuthStore.getState().login('wrong', 'demo');
      expect(result).toBe(false);
    });

    it('returns false for wrong password', () => {
      const result = useAuthStore.getState().login('demo', 'wrong');
      expect(result).toBe(false);
    });

    it('returns false for both wrong', () => {
      const result = useAuthStore.getState().login('wrong', 'wrong');
      expect(result).toBe(false);
    });

    it('does not authenticate on failure', () => {
      useAuthStore.getState().login('wrong', 'wrong');
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('is case-sensitive for username', () => {
      const result = useAuthStore.getState().login('Demo', 'demo');
      expect(result).toBe(false);
    });

    it('is case-sensitive for password', () => {
      const result = useAuthStore.getState().login('demo', 'Demo');
      expect(result).toBe(false);
    });

    it('rejects empty username', () => {
      const result = useAuthStore.getState().login('', 'demo');
      expect(result).toBe(false);
    });

    it('rejects empty password', () => {
      const result = useAuthStore.getState().login('demo', '');
      expect(result).toBe(false);
    });
  });

  describe('logout', () => {
    it('sets isAuthenticated to false', () => {
      useAuthStore.getState().login('demo', 'demo');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      useAuthStore.getState().logout();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('is idempotent when already logged out', () => {
      useAuthStore.getState().logout();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('persistence', () => {
    it('persists auth state to localStorage', () => {
      useAuthStore.getState().login('demo', 'demo');
      const stored = JSON.parse(localStorage.getItem('eeps-admin-auth')!);
      expect(stored.state.isAuthenticated).toBe(true);
    });

    it('persists logout to localStorage', () => {
      useAuthStore.getState().login('demo', 'demo');
      useAuthStore.getState().logout();
      const stored = JSON.parse(localStorage.getItem('eeps-admin-auth')!);
      expect(stored.state.isAuthenticated).toBe(false);
    });
  });
});
