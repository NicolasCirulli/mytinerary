import React from "react";
import { Link } from "react-router";
import { useRegister } from "../hooks/useRegister";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
} from "@shared/icons/AuthIcons";
import { FacebookIcon } from "@shared/icons/SocialIcons";
import { CloseIcon } from "@shared/icons/CloseIcon";
import { AlertCircleIcon } from "@shared/icons/AlertIcons";

// Más adelante mover la lista al backcend y generar un endpoint
const COUNTRIES = [
  "Argentina",
  "Australia",
  "Brazil",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "France",
  "Germany",
  "India",
  "Italy",
  "Japan",
  "Mexico",
  "Netherlands",
  "New Zealand",
  "Peru",
  "Portugal",
  "Spain",
  "United Kingdom",
  "United States",
  "Uruguay",
];

export const RegisterForm: React.FC = () => {
  const {
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
    showConfirmPassword,
    isLoading,
    error,
    setError,
    fieldErrors,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleRegister,
  } = useRegister();

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-xl border border-border">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
        <p className="text-muted-foreground">
          Fill in your details to get started
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* First Name */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="firstName"
          >
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-muted/50 text-foreground placeholder:text-muted-foreground transition-colors"
            placeholder="John"
            required
          />
          {fieldErrors.first_name && (
            <p className="text-sm text-red-500">{fieldErrors.first_name}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="lastName"
          >
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-muted/50 text-foreground placeholder:text-muted-foreground transition-colors"
            placeholder="Doe"
            required
          />
          {fieldErrors.last_name && (
            <p className="text-sm text-red-500">{fieldErrors.last_name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="register-email"
          >
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              <MailIcon className="w-5 h-5" />
            </div>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-muted/50 text-foreground placeholder:text-muted-foreground transition-colors"
              placeholder="john@example.com"
              required
            />
          </div>
          {fieldErrors.email && (
            <p className="text-sm text-red-500">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="register-password"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              <LockIcon className="w-5 h-5" />
            </div>
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-muted/50 text-foreground placeholder:text-muted-foreground transition-colors"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {showPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-sm text-red-500">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              <LockIcon className="w-5 h-5" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-muted/50 text-foreground placeholder:text-muted-foreground transition-colors"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="country"
          >
            Country
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-muted/50 text-foreground placeholder:text-muted-foreground transition-colors"
            required
          >
            <option value="" disabled>
              Select your country
            </option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {fieldErrors.country && (
            <p className="text-sm text-red-500">{fieldErrors.country}</p>
          )}
        </div>

        {/* Description (optional) */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-muted/50 text-foreground placeholder:text-muted-foreground transition-colors resize-none"
            placeholder="Tell us about yourself..."
            rows={3}
          />
        </div>

        {/* Image URL (optional) */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="image"
          >
            Image URL
          </label>
          <input
            id="image"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-muted/50 text-foreground placeholder:text-muted-foreground transition-colors"
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
            <AlertCircleIcon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg
                aria-hidden="true"
                className="mr-2 h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">
            Or sign up with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => console.log("Sign up with Google")}
          className="flex items-center justify-center px-4 py-2 border border-border rounded-lg shadow-sm bg-card text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
        >
          <GoogleIcon className="w-5 h-5 mr-2" />
          Google
        </button>
        <button
          type="button"
          onClick={() => console.log("Sign up with Facebook")}
          className="flex items-center justify-center px-4 py-2 border border-border rounded-lg shadow-sm bg-card text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
        >
          <FacebookIcon className="w-5 h-5 mr-2 text-[#1877F2]" />
          Facebook
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="font-medium text-primary hover:text-primary/80"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
