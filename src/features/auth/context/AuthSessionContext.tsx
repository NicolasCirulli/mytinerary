/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser } from '../types/auth.types';
import { authService } from '../services/auth.services';

interface AuthSessionContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export const AuthSessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const user = await authService.verifyToken();
        if (mounted) setUser(user);
      } catch {
        if (mounted) localStorage.removeItem('token');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const login = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    if (authenticatedUser.token) {
      localStorage.setItem('token', authenticatedUser.token);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthSessionContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
};
