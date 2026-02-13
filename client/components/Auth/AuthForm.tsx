import React from 'react';

interface AuthFormProps {
    email: string;
    setEmail: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    name: string;
    setName: (value: string) => void;
    isRegistering: boolean;
    isCredentialsLoading: boolean;
    isGoogleLoading: boolean;
    handleCredentialsLogin: () => void;
    handleGoogleLogin: () => void;
    toggleMode: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
    email, setEmail,
    password, setPassword,
    name, setName,
    isRegistering,
    isCredentialsLoading,
    isGoogleLoading,
    handleCredentialsLogin,
    handleGoogleLogin,
    toggleMode
}) => {
    return (
        <>
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isRegistering ? 'Create an Account' : 'Login'}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    {isRegistering ? "Enter your details to get started" : "Welcome back! Please enter your details"}
                </p>
            </div>

            <div className="mt-8 space-y-6">
                {/* Google Login is handled in parent or here, but let's pass the handler */}
                <slot name="social-login" /> {/* Simulating slot, but in React we just compose in parent usually, or pass component. Let's keep it simple and assume parent composes or we pass social button as child? Logic says strictly follow plan. Plan said "Atomize Components". */}

                {/* We will render SocialButton in parent to clean this up, or here. Let's keep this focused on the Inputs to be cleaner. */}
                {/* Actually, let's keep the structure close to original for CSS reasons but break it down. */}

                <div className="space-y-4">
                    {isRegistering && (
                        <div>
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field"
                            />
                        </div>
                    )}
                    <div>
                        <input
                            type="email"
                            placeholder="Email ID"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                        />
                    </div>
                </div>

                <button
                    onClick={handleCredentialsLogin}
                    disabled={isGoogleLoading || isCredentialsLoading}
                    className={`btn-primary ${isCredentialsLoading ? 'opacity-70' : ''}`}
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
        </>
    );
};
