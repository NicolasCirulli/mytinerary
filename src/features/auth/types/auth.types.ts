// --- Requests ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  country: string;
  description?: string;
  image?: string;
}

// --- Responses ---

export interface AuthUser {
  _id: string;
  first_name: string;
  last_name: string;
  image: string;
  email: string;
  country: string;
  whishlist: string[];
  token?: string;
}

export interface AuthSuccessResponse {
  status: number;
  statusMsg: string;
  data: AuthUser;
}

export interface AuthErrorResponse {
  error: true;
  status: number;
  statusMsg: string;
}

// --- Session ---

export interface AuthSession {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
