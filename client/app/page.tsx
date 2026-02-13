'use client';

import { useAuthForm } from '@/hooks/useAuthForm';
import { AuthLayout } from '@/components/Auth/AuthLayout';
import { AuthForm } from '@/components/Auth/AuthForm';
import { SocialButton } from '@/components/Auth/SocialButton';

export default function Home() {
  const auth = useAuthForm();

  return (
    <AuthLayout isRegistering={auth.isRegistering}>
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {auth.isRegistering ? 'Create an Account' : 'Login'}
        </h1>
        <p className="text-sm text-gray-600">
          {auth.isRegistering ? "Enter your details to get started" : "Welcome back! Please enter your details"}
        </p>
      </div>

      {/* Social Login */}
      <SocialButton
        onClick={auth.handleGoogleLogin}
        isLoading={auth.isGoogleLoading}
        isDisabled={auth.isGoogleLoading || auth.isCredentialsLoading}
        isRegistering={auth.isRegistering}
      />

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
          or {auth.isRegistering ? 'register' : 'sign up'} with email
        </span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* Credential Form */}
      <AuthForm {...auth} />

      {/* Footer / Toggle */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-600">
          {auth.isRegistering ? "Already have an account?" : "Don't have an account?"} {' '}
          <button
            onClick={auth.toggleMode}
            className="text-green-600 font-medium hover:underline focus:outline-none cursor-pointer"
            aria-label={auth.isRegistering ? "Switch to Login" : "Switch to Register"}
          >
            {auth.isRegistering ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
