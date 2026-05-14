import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRegister } from '../useRegister';
import { authService } from '../../services/auth.services';
import type { AuthUser } from '../../types/auth.types';

vi.mock('../../services/auth.services', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    verifyToken: vi.fn(),
  },
}));

const mockLoginFn = vi.fn();

vi.mock('../../store/auth.store', () => ({
  useAuthStore: vi.fn((selector) => selector({
    login: mockLoginFn,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    logout: vi.fn(),
  })),
}));

const mockRegisterService = authService.register as Mock;

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

function fillValidFields(
  result: { current: ReturnType<typeof useRegister> },
) {
  act(() => {
    result.current.setFirstName('John');
    result.current.setLastName('Doe');
    result.current.setEmail('john@example.com');
    result.current.setPassword('password123');
    result.current.setConfirmPassword('password123');
    result.current.setCountry('Argentina');
  });
}

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useRegister());

    expect(result.current.firstName).toBe('');
    expect(result.current.lastName).toBe('');
    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.confirmPassword).toBe('');
    expect(result.current.country).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.image).toBe('');
    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.fieldErrors).toEqual({});
  });

  it('should toggle password visibility', () => {
    const { result } = renderHook(() => useRegister());

    act(() => { result.current.togglePasswordVisibility(); });
    expect(result.current.showPassword).toBe(true);

    act(() => { result.current.togglePasswordVisibility(); });
    expect(result.current.showPassword).toBe(false);
  });

  it('should toggle confirm password visibility', () => {
    const { result } = renderHook(() => useRegister());

    act(() => { result.current.toggleConfirmPasswordVisibility(); });
    expect(result.current.showConfirmPassword).toBe(true);

    act(() => { result.current.toggleConfirmPasswordVisibility(); });
    expect(result.current.showConfirmPassword).toBe(false);
  });

  it('should update all field setters', () => {
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setFirstName('Jane');
      result.current.setLastName('Smith');
      result.current.setEmail('jane@example.com');
      result.current.setPassword('pass456');
      result.current.setConfirmPassword('pass456');
      result.current.setCountry('Brazil');
      result.current.setDescription('Traveler');
      result.current.setImage('https://example.com/photo.jpg');
    });

    expect(result.current.firstName).toBe('Jane');
    expect(result.current.lastName).toBe('Smith');
    expect(result.current.email).toBe('jane@example.com');
    expect(result.current.password).toBe('pass456');
    expect(result.current.confirmPassword).toBe('pass456');
    expect(result.current.country).toBe('Brazil');
    expect(result.current.description).toBe('Traveler');
    expect(result.current.image).toBe('https://example.com/photo.jpg');
  });

  describe('handleRegister', () => {
    it('should call authService.register and context login on success (AC3)', async () => {
      mockRegisterService.mockResolvedValue(mockAuthUser);

      const { result } = renderHook(() => useRegister());
      fillValidFields(result);

      await act(async () => {
        await result.current.handleRegister(createFormEvent());
      });

      expect(mockRegisterService).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        country: 'Argentina',
        description: undefined,
        image: undefined,
      });
      // localStorage is set by AuthSessionContext.login, not by the hook
      expect(mockLoginFn).toHaveBeenCalledWith(mockAuthUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should send optional fields when provided', async () => {
      mockRegisterService.mockResolvedValue(mockAuthUser);

      const { result } = renderHook(() => useRegister());
      fillValidFields(result);

      act(() => {
        result.current.setDescription('A passionate traveler');
        result.current.setImage('https://example.com/avatar.jpg');
      });

      await act(async () => {
        await result.current.handleRegister(createFormEvent());
      });

      expect(mockRegisterService).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        country: 'Argentina',
        description: 'A passionate traveler',
        image: 'https://example.com/avatar.jpg',
      });
    });

    it('should show error on password mismatch (AC6 validation, no API call)', async () => {
      const { result } = renderHook(() => useRegister());
      fillValidFields(result);

      act(() => {
        result.current.setConfirmPassword('different-password');
      });

      await act(async () => {
        await result.current.handleRegister(createFormEvent());
      });

      expect(result.current.error).toBe('Passwords do not match');
      expect(mockRegisterService).not.toHaveBeenCalled();
    });

    it('should show error on missing required fields (no API call)', async () => {
      const { result } = renderHook(() => useRegister());

      await act(async () => {
        await result.current.handleRegister(createFormEvent());
      });

      expect(result.current.error).toBe('All required fields must be filled out');
      expect(mockRegisterService).not.toHaveBeenCalled();
    });

    it('should set "Email is already in use" on 409 (AC4)', async () => {
      mockRegisterService.mockRejectedValue({
        response: { status: 409, data: { statusMsg: 'Email is already in use' } },
      });

      const { result } = renderHook(() => useRegister());
      fillValidFields(result);

      await act(async () => {
        await result.current.handleRegister(createFormEvent());
      });

      expect(result.current.error).toBe('Email is already in use');
    });

    it('should set fieldErrors on 400 validation error (AC5)', async () => {
      mockRegisterService.mockRejectedValue({
        response: {
          status: 400,
          data: {
            statusMsg: 'Validation failed',
            errors: {
              email: 'Email is already registered',
              password: 'Password must be at least 6 characters',
            },
          },
        },
      });

      const { result } = renderHook(() => useRegister());
      fillValidFields(result);

      await act(async () => {
        await result.current.handleRegister(createFormEvent());
      });

      expect(result.current.fieldErrors).toEqual({
        email: 'Email is already registered',
        password: 'Password must be at least 6 characters',
      });
      expect(result.current.error).toBe('Validation failed');
    });

    it('should set generic error on 400 without field errors', async () => {
      mockRegisterService.mockRejectedValue({
        response: { status: 400, data: { statusMsg: 'Bad request' } },
      });

      const { result } = renderHook(() => useRegister());
      fillValidFields(result);

      await act(async () => {
        await result.current.handleRegister(createFormEvent());
      });

      expect(result.current.error).toBe('Bad request');
    });

    it('should set fallback error on unknown status', async () => {
      mockRegisterService.mockRejectedValue({
        response: { status: 500, data: {} },
      });

      const { result } = renderHook(() => useRegister());
      fillValidFields(result);

      await act(async () => {
        await result.current.handleRegister(createFormEvent());
      });

      expect(result.current.error).toBe('Registration failed');
    });

    it('should clear previous error and fieldErrors before submission', async () => {
      // First attempt fails
      mockRegisterService.mockRejectedValue({
        response: { status: 409, data: { statusMsg: 'Email is already in use' } },
      });

      const { result } = renderHook(() => useRegister());
      fillValidFields(result);

      await act(async () => {
        await result.current.handleRegister(createFormEvent());
      });
      expect(result.current.error).toBe('Email is already in use');

      // Second attempt succeeds
      mockRegisterService.mockResolvedValue(mockAuthUser);
      await act(async () => {
        await result.current.handleRegister(createFormEvent());
      });

      expect(result.current.error).toBeNull();
      expect(result.current.fieldErrors).toEqual({});
    });

    it('should set isLoading while request is in flight and false after completion', async () => {
      let resolvePromise!: (value: AuthUser) => void;
      mockRegisterService.mockImplementation(
        () => new Promise<AuthUser>((resolve) => { resolvePromise = resolve; }),
      );

      const { result } = renderHook(() => useRegister());
      fillValidFields(result);

      // Start the registration
      act(() => {
        result.current.handleRegister(createFormEvent());
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
});
