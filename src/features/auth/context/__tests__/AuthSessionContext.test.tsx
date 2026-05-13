import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthSessionProvider } from '../AuthSessionContext';
import { useAuthSession } from '../../hooks/useAuthSession';
import { authService } from '../../services/auth.services';
import type { AuthUser } from '../../types/auth.types';

vi.mock('../../services/auth.services', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    verifyToken: vi.fn(),
  },
}));

const mockVerifyToken = authService.verifyToken as Mock;

const mockAuthUser: AuthUser = {
  _id: '64abc123',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  image: 'https://example.com/photo.jpg',
  country: 'Argentina',
  whishlist: [],
  token: 'jwt-token-123',
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}

describe('AuthSessionProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  it('should set isLoading=false when no token in localStorage', async () => {
    const { result } = renderHook(() => useAuthSession(), { wrapper });

    // Wait for the useEffect to complete
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockVerifyToken).not.toHaveBeenCalled();
  });

  it('should verify valid token and set user on mount (AC8)', async () => {
    localStorage.setItem('token', 'valid-token');
    mockVerifyToken.mockResolvedValue(mockAuthUser);

    const { result } = renderHook(() => useAuthSession(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockVerifyToken).toHaveBeenCalledWith();
    expect(result.current.user).toEqual(mockAuthUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should clear invalid token on mount (AC9)', async () => {
    localStorage.setItem('token', 'expired-token');
    mockVerifyToken.mockRejectedValue({
      response: { status: 401, data: { statusMsg: 'Invalid token' } },
    });

    const { result } = renderHook(() => useAuthSession(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockVerifyToken).toHaveBeenCalledWith();
    expect(localStorage.getItem('token')).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set user and save token on login', () => {
    const { result } = renderHook(() => useAuthSession(), { wrapper });

    act(() => {
      result.current.login(mockAuthUser);
    });

    expect(result.current.user).toEqual(mockAuthUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe('jwt-token-123');
  });

  it('should not save token on login if user has no token field', () => {
    const userWithoutToken: AuthUser = { ...mockAuthUser, token: undefined };
    const { result } = renderHook(() => useAuthSession(), { wrapper });

    act(() => {
      result.current.login(userWithoutToken);
    });

    expect(result.current.user).toEqual(userWithoutToken);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should clear user and token on logout', () => {
    localStorage.setItem('token', 'some-token');
    const { result } = renderHook(() => useAuthSession(), { wrapper });

    act(() => {
      // First login so we have a user
      result.current.login(mockAuthUser);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });
});
