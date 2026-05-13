import { useState, type FormEvent } from 'react';
import { authService } from '../services/auth.services';
import { useAuthSession } from './useAuthSession';

export const useRegister = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { login } = useAuthSession();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    // Local validation: required fields
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !country.trim()) {
      setError('All required fields must be filled out');
      return;
    }

    // Local validation: confirm password must match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const user = await authService.register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        country,
        description: description || undefined,
        image: image || undefined,
      });
      login(user);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          status?: number;
          data?: {
            statusMsg?: string;
            errors?: Record<string, string>;
          };
        };
      };
      const status = axiosError?.response?.status;
      if (status === 409) {
        setError('Email is already in use');
      } else if (status === 400) {
        const errors = axiosError?.response?.data?.errors;
        if (errors) {
          setFieldErrors(errors);
        }
        setError(axiosError?.response?.data?.statusMsg ?? 'Registration failed');
      } else {
        setError(
          axiosError?.response?.data?.statusMsg ?? 'Registration failed',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    country,
    setCountry,
    description,
    setDescription,
    image,
    setImage,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isLoading,
    error,
    setError,
    fieldErrors,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleRegister,
  };
};
