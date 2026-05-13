import React from 'react';
import { SEO } from '@shared/seo/SEO';
import { RegisterForm } from '@features/auth/components/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Create Account"
        description="Create your Mytinerary account to save itineraries, preferences, and travel plans."
        canonical="/register"
      />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <RegisterForm />
      </div>
    </>
  );
};

export default RegisterPage;
