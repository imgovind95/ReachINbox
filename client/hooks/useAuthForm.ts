import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const useAuthForm = () => {
    const { data: session } = useSession();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('userId');

        if (userId) {
            signIn('credentials', { userId, callbackUrl: '/dashboard' });
        } else if (session?.user) {
            if (window.location.pathname === '/') {
                router.replace('/dashboard');
            }
        }
    }, [session, router]);

    const handleCredentialsLogin = async () => {
        if (!email || !password) {
            alert("Please provide email and password");
            return;
        }
        if (isRegistering && !name) {
            alert("Please provide your name");
            return;
        }

        setIsCredentialsLoading(true);
        try {
            const result = await signIn('credentials', {
                email,
                password,
                name: isRegistering ? name : undefined,
                callbackUrl: '/dashboard',
                redirect: false,
            });

            if (result?.error) {
                alert(`Login Failed: ${result.error}`);
                setIsCredentialsLoading(false);
            } else if (result?.url) {
                router.push('/dashboard');
            } else {
                setIsCredentialsLoading(false);
            }
        } catch (error) {
            console.error("Login failed", error);
            alert("An unexpected error occurred.");
            setIsCredentialsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setIsGoogleLoading(true);
        signIn('google', { callbackUrl: '/dashboard' });
    };

    const toggleMode = () => setIsRegistering(!isRegistering);

    return {
        email, setEmail,
        password, setPassword,
        name, setName,
        isRegistering, toggleMode,
        isGoogleLoading,
        isCredentialsLoading,
        handleCredentialsLogin,
        handleGoogleLogin
    };
};
