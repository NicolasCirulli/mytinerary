import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../api';
import { useAuthStore } from '@features/auth/store/auth.store';

// Mock de window.location simplificado
const mockLocation = {
  href: 'http://localhost:5173/',
  pathname: '/',
};
delete (window as any).location;
window.location = mockLocation as any;

describe('Axios Interceptors (Isolated)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
    mockLocation.href = 'http://localhost:5173/';
    mockLocation.pathname = '/';
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header from store state', async () => {
      useAuthStore.setState({ token: 'store-token', isAuthenticated: true });
      
      let capturedConfig: any;
      api.defaults.adapter = async (config) => {
          capturedConfig = config;
          return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
      };

      await api.get('/test');

      const authHeader = capturedConfig.headers.Authorization || capturedConfig.headers.get?.('Authorization');
      expect(authHeader).toBe('Bearer store-token');
    });

    it('should NOT add Authorization header if store token is null', async () => {
      useAuthStore.setState({ token: null, isAuthenticated: false });
      
      let capturedConfig: any;
      api.defaults.adapter = async (config) => {
          capturedConfig = config;
          return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
      };

      await api.get('/test');

      const authHeader = capturedConfig.headers.Authorization || capturedConfig.headers.get?.('Authorization');
      expect(authHeader).toBeUndefined();
    });
  });

  describe('Response Interceptor', () => {
    it('should call setLogout on 401 error (no redirect here)', async () => {
      const logoutSpy = vi.spyOn(useAuthStore.getState(), 'setLogout');
      
      api.defaults.adapter = async () => {
          throw {
              response: { status: 401 }
          };
      };

      try {
        await api.get('/protected');
      } catch (err) {
        // expected
      }

      expect(logoutSpy).toHaveBeenCalled();
      // Verificamos que ya NO redirige directamente (responsabilidad de la UI/Router)
      expect(mockLocation.href).toBe('http://localhost:5173/');
    });

    it('should return response data directly on success', async () => {
        const mockData = { id: 1, name: 'Test' };
        api.defaults.adapter = async (config) => {
            return {
                data: mockData, 
                status: 200,
                statusText: 'OK',
                headers: {},
                config
            };
        };

        const result = await api.get('/test');
        expect(result).toEqual(mockData);
    });
  });
});
