import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLogin } from '../useLogin';
import { authService } from '../../services/auth.services';
import type { AuthUser } from '../../types/auth.types';

vi.mock('../../services/auth.services', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    verifyToken: vi.fn(),
  },
}));

const mockSetLoginFn = vi.fn();

vi.mock('../../store/auth.store', () => ({
  useAuthStore: vi.fn((selector) => selector({
    setLogin: mockSetLoginFn,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    setLogout: vi.fn(),
  })),
}));

const mockLoginService = authService.login as Mock;

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

function createFormEvent(): React.FormEvent {
  return { preventDefault: vi.fn() } as unknown as React.FormEvent;
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.showPassword).toBe(false);
    expect(result.current.rememberMe).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should toggle password visibility', () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.togglePasswordVisibility();
    });
    expect(result.current.showPassword).toBe(true);

    act(() => {
      result.current.togglePasswordVisibility();
    });
    expect(result.current.showPassword).toBe(false);
  });

  it('should toggle remember me', () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.toggleRememberMe();
    });
    expect(result.current.rememberMe).toBe(true);

    act(() => {
      result.current.toggleRememberMe();
    });
    expect(result.current.rememberMe).toBe(false);
  });

  it('should update email and password setters', () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('mypassword');
    });

    expect(result.current.email).toBe('test@example.com');
    expect(result.current.password).toBe('mypassword');
  });

  describe('handleLogin', () => {
    it('should call authService.login and context login on success (AC1)', async () => {
      mockLoginService.mockResolvedValue(mockAuthUser);

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('john@example.com');
        result.current.setPassword('password123');
      });

      await act(async () => {
        await result.current.handleLogin(createFormEvent());
      });

      expect(mockLoginService).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
      });
      
      expect(mockSetLoginFn).toHaveBeenCalledWith(mockAuthUser, mockAuthUser.token);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set error message on 401 failure (AC2)', async () => {
      mockLoginService.mockRejectedValue({
        response: {
          status: 401,
          data: { statusMsg: 'Email or password is incorrect' },
        },
      });

      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin(createFormEvent());
      });

      expect(result.current.error).toBe('Email or password is incorrect');
      expect(mockSetLoginFn).not.toHaveBeenCalled();
    });

    it('should set fallback error message when no statusMsg', async () => {
      mockLoginService.mockRejectedValue({
        response: { status: 500 },
      });

      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin(createFormEvent());
      });

      expect(result.current.error).toBe('Login failed');
    });

    it('should clear existing error before login attempt', async () => {
      mockLoginService.mockRejectedValue({
        response: { status: 401, data: { statusMsg: 'Error' } },
      });

      const { result } = renderHook(() => useLogin());

      // First attempt fails
      await act(async () => {
        await result.current.handleLogin(createFormEvent());
      });
      expect(result.current.error).toBe('Error');

      // Second attempt clears error first
      mockLoginService.mockResolvedValue(mockAuthUser);
      await act(async () => {
        await result.current.handleLogin(createFormEvent());
      });

      expect(result.current.error).toBeNull();
    });

    it('should set isLoading while request is in flight and false after completion', async () => {
      // Use a deferred promise to control timing
      let resolvePromise!: (value: AuthUser) => void;
      mockLoginService.mockImplementation(
        () => new Promise<AuthUser>((resolve) => { resolvePromise = resolve; }),
      );

      const { result } = renderHook(() => useLogin());

      // Start the login
      act(() => {
        result.current.handleLogin(createFormEvent());
      });

      // isLoading should be true while request is pending
      expect(result.current.isLoading).toBe(true);

      // Resolve the request
      await act(async () => {
        resolvePromise(mockAuthUser);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('social login handlers', () => {
    it('should log Google login message', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useLogin());

      result.current.handleGoogleLogin();

      expect(consoleSpy).toHaveBeenCalledWith('Login with Google');
      consoleSpy.mockRestore();
    });

    it('should log Facebook login message', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useLogin());

      result.current.handleFacebookLogin();

      expect(consoleSpy).toHaveBeenCalledWith('Login with Facebook');
      consoleSpy.mockRestore();
    });
  });
});
