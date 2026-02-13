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
    handleGoogleLogin, // Unused here now, but kept in props interface
    toggleMode // Unused here now
}) => {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {isRegistering && (
                    <div>
                        <div className="text-sm font-medium text-gray-700 mb-1.5 ml-1">Name</div>
                        <input
                            type="text"
                            placeholder="Ex. John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field"
                        />
                    </div>
                )}
                <div>
                    <div className="text-sm font-medium text-gray-700 mb-1.5 ml-1">Email</div>
                    <input
                        type="email"
                        placeholder="Ex. john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                    />
                </div>
                <div>
                    <div className="text-sm font-medium text-gray-700 mb-1.5 ml-1">Password</div>
                    <input
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                    />
                </div>
            </div>

            <button
                onClick={handleCredentialsLogin}
                disabled={isGoogleLoading || isCredentialsLoading}
                className={`btn-primary w-full ${isCredentialsLoading ? 'opacity-70' : ''}`}
            >
                {isCredentialsLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block align-middle"></div>}
                {isRegistering ? 'Register' : 'Login'}
            </button>
        </div>
    );
};
