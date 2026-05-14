import React from "react";
import { Link } from "react-router";
import { useLogin } from "../hooks/useLogin";
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

export const LoginForm: React.FC = () => {
  const {
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
  } = useLogin();

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-xl border border-border">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground">
          Enter your details to access your account
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              <MailIcon className="w-5 h-5" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-muted/50 text-foreground placeholder:text-muted-foreground transition-colors"
              placeholder="name@company.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="password"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              <LockIcon className="w-5 h-5" />
            </div>
            <input
              id="password"
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
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={toggleRememberMe}
              className="h-4 w-4 text-primary focus:ring-ring border-border rounded cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-foreground cursor-pointer"
            >
              Remember me
            </label>
          </div>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
            <AlertCircleIcon className="h-4 w-4 shrink-0" />
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
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex items-center justify-center px-4 py-2 border border-border rounded-lg shadow-sm bg-card text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
        >
          <GoogleIcon className="w-5 h-5 mr-2" />
          Google
        </button>
        <button
          type="button"
          onClick={handleFacebookLogin}
          className="flex items-center justify-center px-4 py-2 border border-border rounded-lg shadow-sm bg-card text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
        >
          <FacebookIcon className="w-5 h-5 mr-2 text-[#1877F2]" />
          Facebook
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          to="/auth/register"
          className="font-medium text-primary hover:text-primary/80"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};
