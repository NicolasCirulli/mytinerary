import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../auth.store';
import type { AuthUser } from '../../types/auth.types';

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

describe('auth.store (Refactored)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useAuthStore.getState().setLogout();
    // Reset intentional loading state for tests
    useAuthStore.setState({ isLoading: true });
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  describe('setLogin', () => {
    it('should set user, token and mark as authenticated', () => {
      useAuthStore.getState().setLogin(mockAuthUser, 'new-token');
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockAuthUser);
      expect(state.token).toBe('new-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      
      // Verify persistence (managed by middleware)
      const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      expect(stored.state.token).toBe('new-token');
    });
  });

  describe('setLogout', () => {
    it('should clear all auth data', () => {
      useAuthStore.getState().setLogin(mockAuthUser, 'some-token');
      useAuthStore.getState().setLogout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      
      const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      expect(stored.state.token).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should update user and derive isAuthenticated', () => {
      useAuthStore.getState().setUser(mockAuthUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).toEqual(mockAuthUser);

      useAuthStore.getState().setUser(null);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
