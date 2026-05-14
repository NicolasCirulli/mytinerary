import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { useAuthStore } from '../auth.store';
import { authService } from '../../services/auth.services';
import type { AuthUser } from '../../types/auth.types';

vi.mock('../../services/auth.services', () => ({
  authService: {
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

describe('auth.store', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  describe('login', () => {
    it('should set user and save token to localStorage', () => {
      useAuthStore.getState().login(mockAuthUser);
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockAuthUser);
      expect(state.isAuthenticated).toBe(true);
      expect(localStorage.getItem('token')).toBe('jwt-token-123');
    });

    it('should not save token if user does not have one', () => {
      const userWithoutToken = { ...mockAuthUser, token: undefined };
      useAuthStore.getState().login(userWithoutToken);
      
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear user and remove token from localStorage', () => {
      localStorage.setItem('token', 'some-token');
      useAuthStore.setState({ user: mockAuthUser, isAuthenticated: true });

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('initSession', () => {
    it('should set isLoading=false if no token in localStorage', async () => {
      await useAuthStore.getState().initSession();

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it('should verify valid token and set user', async () => {
      localStorage.setItem('token', 'valid-token');
      mockVerifyToken.mockResolvedValue(mockAuthUser);

      await useAuthStore.getState().initSession();

      const state = useAuthStore.getState();
      expect(mockVerifyToken).toHaveBeenCalled();
      expect(state.user).toEqual(mockAuthUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should clear invalid token on failure', async () => {
      localStorage.setItem('token', 'expired-token');
      mockVerifyToken.mockRejectedValue(new Error('Invalid token'));

      await useAuthStore.getState().initSession();

      const state = useAuthStore.getState();
      expect(mockVerifyToken).toHaveBeenCalled();
      expect(localStorage.getItem('token')).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });
});
