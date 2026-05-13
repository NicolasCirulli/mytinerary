import { useState, type FormEvent } from 'react';
import { authService } from '../services/auth.services';
import { useAuthSession } from './useAuthSession';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuthSession();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (error) {
      setError(null);
    }
    setIsLoading(true);

    try {
      const user = await authService.login({ email, password });
      login(user);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { statusMsg?: string } } })?.response
          ?.data?.statusMsg ?? 'Login failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Login with Google');
  };

  const handleFacebookLogin = () => {
    console.log('Login with Facebook');
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    rememberMe,
    isLoading,
    error,
    setError,
    togglePasswordVisibility,
    toggleRememberMe,
    handleLogin,
    handleGoogleLogin,
    handleFacebookLogin,
  };
};
