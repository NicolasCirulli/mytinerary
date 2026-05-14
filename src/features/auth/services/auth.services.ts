import api from '@shared/api/api';
import type {
  LoginRequest,
  RegisterRequest,
  AuthSuccessResponse,
  AuthUser,
} from '../types/auth.types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthUser> {
    const response = await api.post('/auth/login', data) as AuthSuccessResponse;
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthUser> {
    const response = await api.post('/auth/register', data) as AuthSuccessResponse;
    return response.data;
  },

  async verifyToken(): Promise<AuthUser> {
    const response = await api.post('/auth/token') as AuthSuccessResponse;
    return response.data;
  },
};
