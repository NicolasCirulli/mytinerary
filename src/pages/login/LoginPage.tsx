import React from "react";
import { SEO } from "@shared/seo/SEO";
import { LoginForm } from "@features/auth/components/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Sign In"
        description="Sign in to your Mytinerary account to access your saved itineraries, preferences, and travel plans."
        canonical="/auth/login"
      />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <LoginForm />
      </div>
    </>
  );
};

export default LoginPage;
