import React from 'react';

interface FormProps {
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    name: string;
    setName: (val: string) => void;
    isRegistering: boolean;
    toggleMode: () => void;
    isGoogleLoading: boolean;
    onGoogleLogin: () => void;
    isCredentialsLoading: boolean;
    onCredentialsLogin: () => void;
}

export const LoginForm: React.FC<FormProps> = ({
    email, setEmail,
    password, setPassword,
    name, setName,
    isRegistering, toggleMode,
    isGoogleLoading, onGoogleLogin,
    isCredentialsLoading, onCredentialsLogin
}) => {
    return (
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
            <div className="w-full max-w-md space-y-8">

                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isRegistering ? 'Create an Account' : 'Login'}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        {isRegistering ? "Enter your details to get started" : "Welcome back! Please enter your details"}
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    {/* Google OAuth Button */}
                    <button
                        onClick={onGoogleLogin}
                        disabled={isGoogleLoading || isCredentialsLoading}
                        className={`w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-md flex items-center justify-center gap-3 transition-colors cursor-pointer ${isGoogleLoading ? 'opacity-70' : ''}`}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        {isRegistering ? 'Sign up with Google' : 'Login with Google'}
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-sm text-gray-500 font-medium whitespace-nowrap">or {isRegistering ? 'register' : 'sign up'} with email</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <div className="space-y-4">
                        {isRegistering && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 text-gray-900 placeholder-gray-500 px-4 py-3 rounded-md border border-gray-200 focus:border-green-500 focus:bg-white outline-none transition-all"
                                />
                            </div>
                        )}
                        <div>
                            <input
                                type="email"
                                placeholder="Email ID"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 text-gray-900 placeholder-gray-500 px-4 py-3 rounded-md border border-gray-200 focus:border-green-500 focus:bg-white outline-none transition-all"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 text-gray-900 placeholder-gray-500 px-4 py-3 rounded-md border border-gray-200 focus:border-green-500 focus:bg-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        onClick={onCredentialsLogin}
                        disabled={isGoogleLoading || isCredentialsLoading}
                        className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer ${isCredentialsLoading ? 'opacity-70' : ''}`}
                    >
                        {isCredentialsLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {isRegistering ? 'Register' : 'Login'}
                    </button>
                </div>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        {isRegistering ? "Already have an account?" : "Don't have an account?"} {' '}
                        <button
                            onClick={toggleMode}
                            className="text-green-600 font-medium hover:underline focus:outline-none cursor-pointer"
                            aria-label={isRegistering ? "Switch to Login" : "Switch to Register"}
                        >
                            {isRegistering ? 'Login' : 'Register'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
"there is one error like , when we are click on the google login then open select email and sign continue and then, redirect to login page only , it only happen with the login with google only , when we are try through email it is logged in normally"