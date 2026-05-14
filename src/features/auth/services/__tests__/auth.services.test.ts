import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@shared/api/api';
import { authService } from '../auth.services';
import type { AuthUser } from '../../types/auth.types';

vi.mock('@shared/api/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockPost = api.post as ReturnType<typeof vi.fn>;

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

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    const loginData = { email: 'john@example.com', password: 'password123' };

    it('should return AuthUser on successful login', async () => {
      mockPost.mockResolvedValue({
        status: 200,
        statusMsg: 'success',
        data: mockAuthUser,
      });

      const result = await authService.login(loginData);

      expect(result).toEqual(mockAuthUser);
      expect(mockPost).toHaveBeenCalledWith('/auth/login', loginData);
      expect(mockPost).toHaveBeenCalledTimes(1);
    });

    it('should propagate error when login fails', async () => {
      const apiError = {
        response: {
          status: 401,
          data: { statusMsg: 'Email or password is incorrect' },
        },
      };
      mockPost.mockRejectedValue(apiError);

      await expect(authService.login(loginData)).rejects.toEqual(apiError);
    });
  });

  describe('register', () => {
    const registerData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      country: 'Argentina',
    };

    it('should return AuthUser on successful registration', async () => {
      mockPost.mockResolvedValue({
        status: 201,
        statusMsg: 'created',
        data: mockAuthUser,
      });

      const result = await authService.register(registerData);

      expect(result).toEqual(mockAuthUser);
      expect(mockPost).toHaveBeenCalledWith('/auth/register', registerData);
    });

    it('should propagate error when registration fails (409 conflict)', async () => {
      const apiError = {
        response: {
          status: 409,
          data: { statusMsg: 'Email is already in use' },
        },
      };
      mockPost.mockRejectedValue(apiError);

      await expect(authService.register(registerData)).rejects.toEqual(apiError);
    });

    it('should propagate error when registration fails (400 validation)', async () => {
      const apiError = {
        response: {
          status: 400,
          data: {
            statusMsg: 'Validation failed',
            errors: { email: 'Email already registered', password: 'Too short' },
          },
        },
      };
      mockPost.mockRejectedValue(apiError);

      await expect(authService.register(registerData)).rejects.toEqual(apiError);
    });

    it('should send optional fields when provided', async () => {
      const fullData = {
        ...registerData,
        description: 'A traveler',
        image: 'https://example.com/photo.jpg',
      };
      mockPost.mockResolvedValue({
        status: 201,
        statusMsg: 'created',
        data: mockAuthUser,
      });

      await authService.register(fullData);

      expect(mockPost).toHaveBeenCalledWith('/auth/register', fullData);
    });
  });

  describe('verifyToken', () => {
    it('should return AuthUser on valid token', async () => {
      mockPost.mockResolvedValue({
        status: 200,
        statusMsg: 'ok',
        data: mockAuthUser,
      });

      const result = await authService.verifyToken();

      expect(result).toEqual(mockAuthUser);
      expect(mockPost).toHaveBeenCalledWith('/auth/token');
    });

    it('should propagate error when token is invalid', async () => {
      const apiError = {
        response: {
          status: 401,
          data: { statusMsg: 'Invalid or expired token' },
        },
      };
      mockPost.mockRejectedValue(apiError);

      await expect(authService.verifyToken()).rejects.toEqual(apiError);
    });
  });
});
