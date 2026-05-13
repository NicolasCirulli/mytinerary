import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuthSession } from '../useAuthSession';
import { AuthSessionProvider } from '../../context/AuthSessionContext';

vi.mock('../../services/auth.services', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    verifyToken: vi.fn(),
  },
}));

vi.mock('../useAuthSession', async (importOriginal) => {
  const actual = await importOriginal();
  return actual;
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}

describe('useAuthSession', () => {
  it('should return context value when used inside AuthSessionProvider (AC12)', () => {
    const { result } = renderHook(() => useAuthSession(), { wrapper });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('should throw error when used outside AuthSessionProvider', () => {
    expect(() => {
      renderHook(() => useAuthSession());
    }).toThrow('useAuthSession debe usarse dentro de AuthSessionProvider');
  });
});
