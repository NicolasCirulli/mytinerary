import { create } from "zustand";
import type { AuthUser } from "../types/auth.types";
import { authService } from "../services/auth.services";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  initSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (authenticatedUser: AuthUser) => {
    set({ user: authenticatedUser, isAuthenticated: true });
    if (authenticatedUser.token) {
      localStorage.setItem("token", authenticatedUser.token);
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false });
  },

  initSession: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      set({ isLoading: false, user: null, isAuthenticated: false });
      return;
    }

    try {
      const userData = await authService.verifyToken();
      set({ user: userData, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error("Error verificando sesion:", error);
      localStorage.removeItem("token");
      set({ isLoading: false, user: null, isAuthenticated: false });
    }
  },
}));
