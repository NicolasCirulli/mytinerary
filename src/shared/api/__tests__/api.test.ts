import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';

// We need to test the interceptor handlers by extracting them from axios internals.
// Since vi.mock factory closures are tricky with vitest hoisting,
// we import the real api module and access handlers via the InterceptorManager API.

describe('API Interceptor', () => {
  let api: import('axios').AxiosInstance;

  beforeAll(async () => {
    // Import after mock is registered (we mock localStorage and window only)
    const mod = await import('../api');
    api = mod.default;
  });

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Reset window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  describe('module configuration', () => {
    it('should have correct baseURL and timeout', () => {
      expect(api.defaults.baseURL).toBe('http://localhost:8080/api');
      expect(api.defaults.timeout).toBe(10000);
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('request interceptor', () => {
    it('should add Bearer token when token exists in localStorage', () => {
      const handlers = (api.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: Record<string, unknown>) => Record<string, unknown> }>;
      }).handlers;
      const fulfilledHandler = handlers[0].fulfilled;

      localStorage.setItem('token', 'test-jwt-token');
      const config: Record<string, unknown> = { headers: {} };

      const result = fulfilledHandler(config);

      expect(result).toBe(config);
      expect((result.headers as Record<string, string>).Authorization).toBe(
        'Bearer test-jwt-token',
      );
    });

    it('should not add Authorization header when no token exists', () => {
      const handlers = (api.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: Record<string, unknown>) => Record<string, unknown> }>;
      }).handlers;
      const fulfilledHandler = handlers[0].fulfilled;

      const config: Record<string, unknown> = { headers: {} };

      const result = fulfilledHandler(config);

      expect(
        (result.headers as Record<string, string>).Authorization,
      ).toBeUndefined();
    });

    it('should overwrite existing Authorization header when a new token is present', () => {
      const handlers = (api.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: Record<string, unknown>) => Record<string, unknown> }>;
      }).handlers;
      const fulfilledHandler = handlers[0].fulfilled;

      localStorage.setItem('token', 'new-token');
      const config: Record<string, unknown> = {
        headers: { Authorization: 'Bearer old-token' },
      };

      const result = fulfilledHandler(config);

      // The interceptor always sets the header from localStorage
      expect(
        (result.headers as Record<string, string>).Authorization,
      ).toBe('Bearer new-token');
    });
  });

  describe('response success interceptor', () => {
    it('should extract response.data on success', () => {
      const handlers = (api.interceptors.response as unknown as {
        handlers: Array<{ fulfilled: (response: Record<string, unknown>) => unknown }>;
      }).handlers;
      const fulfilledHandler = handlers[0].fulfilled;

      const response = {
        data: {
          status: 200,
          statusMsg: 'ok',
          data: { _id: '1', email: 'test@test.com' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      const result = fulfilledHandler(response);

      expect(result).toEqual({
        status: 200,
        statusMsg: 'ok',
        data: { _id: '1', email: 'test@test.com' },
      });
    });
  });

  describe('response error interceptor (AC10)', () => {
    it('should remove token, warn, and redirect on 401', async () => {
      const handlers = (api.interceptors.response as unknown as {
        handlers: Array<{
          rejected: (error: Record<string, unknown>) => Promise<never>;
        }>;
      }).handlers;
      const rejectedHandler = handlers[0].rejected;

      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      localStorage.setItem('token', 'expired-token');

      const error401 = {
        response: { status: 401, data: { statusMsg: 'Unauthorized' } },
      };

      // The side effects (removeItem, location.href, warn) happen synchronously
      // before the Promise.reject(error) is returned
      const promise = rejectedHandler(error401);

      expect(localStorage.getItem('token')).toBeNull();
      expect(mockLocation.href).toBe('/login');
      expect(console.warn).toHaveBeenCalledWith(
        '[API] Unauthorized - redirecting to login',
      );

      // Await the rejection to avoid unhandled rejection in the test
      await expect(promise).rejects.toBe(error401);
    });

    it('should reject on non-401 errors without redirecting', async () => {
      const handlers = (api.interceptors.response as unknown as {
        handlers: Array<{
          rejected: (error: Record<string, unknown>) => Promise<never>;
        }>;
      }).handlers;
      const rejectedHandler = handlers[0].rejected;

      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      const error500 = {
        response: { status: 500, data: { statusMsg: 'Server error' } },
      };

      await expect(rejectedHandler(error500)).rejects.toBe(error500);
      expect(mockLocation.href).not.toBe('/login');
    });

    it('should reject on network errors without response', async () => {
      const handlers = (api.interceptors.response as unknown as {
        handlers: Array<{
          rejected: (error: Record<string, unknown>) => Promise<never>;
        }>;
      }).handlers;
      const rejectedHandler = handlers[0].rejected;

      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      const networkError = { message: 'Network Error', response: undefined };

      await expect(rejectedHandler(networkError)).rejects.toBe(networkError);
      expect(mockLocation.href).not.toBe('/login');
    });
  });
});
