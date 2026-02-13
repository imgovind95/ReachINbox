import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    isRegistering: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, isRegistering }) => {
    return (
        <div className="min-h-screen bg-white flex w-full">
            {/* Left Panel - Branding/Welcome (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-50 flex-col justify-center items-center p-12 relative overflow-hidden">
                <div className="z-10 text-center max-w-md">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">Welcome to ReachInbox</h2>
                    <p className="text-gray-600 text-lg">
                        Automate your outreach and scale your sales pipeline with ease.
                        {isRegistering ? " Join us today!" : " Sign in to continue."}
                    </p>
                </div>
                {/* Abstract decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
                <div className="w-full max-w-md space-y-8">
                    {children}
                </div>
            </div>
        </div>
    );
};
