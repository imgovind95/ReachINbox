'use client';

import { useAuthForm } from '@/hooks/useAuthForm';
import { AuthLayout } from '@/components/Auth/AuthLayout';
import { AuthForm } from '@/components/Auth/AuthForm';
import { SocialButton } from '@/components/Auth/SocialButton';

export default function Home() {
  const auth = useAuthForm();

  return (
    <AuthLayout isRegistering={auth.isRegistering}>
      <SocialButton
        onClick={auth.handleGoogleLogin}
        isLoading={auth.isGoogleLoading}
        isDisabled={auth.isGoogleLoading || auth.isCredentialsLoading}
        isRegistering={auth.isRegistering}
      />

      <div className="flex items-center gap-4">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
          or {auth.isRegistering ? 'register' : 'sign up'} with email
        </span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      <AuthForm {...auth} />
    </AuthLayout>
  );
}
