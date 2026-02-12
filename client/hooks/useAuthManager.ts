import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const useAuthManager = () => {
    const { data: session } = useSession();
    const navigator = useRouter();

    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);
    const [isAuthenticatingGoogle, setIsAuthenticatingGoogle] = useState(false);
    const [isAuthenticatingCredentials, setIsAuthenticatingCredentials] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const backendUserId = queryParams.get('userId');

        if (backendUserId) {
            signIn('credentials', { userId: backendUserId, callbackUrl: '/dashboard' });
        } else if (session) {
            navigator.push('/dashboard');
        }
    }, [session, navigator]);

    const performCredentialsLogin = async () => {
        if (!userEmail || !userPassword) {
            alert("Credentials missing");
            return;
        }
        if (isNewUser && !userName) {
            alert("Name is required for registration");
            return;
        }

        setIsAuthenticatingCredentials(true);
        try {
            await signIn('credentials', {
                email: userEmail,
                password: userPassword,
                name: isNewUser ? userName : undefined,
                callbackUrl: '/dashboard'
            });
        } catch (err) {
            console.error("Authentication failed", err);
            setIsAuthenticatingCredentials(false);
        }
    };

    const performGoogleLogin = () => {
        setIsAuthenticatingGoogle(true);
        signIn('google', { callbackUrl: '/dashboard' });
    };

    const toggleMode = () => setIsNewUser(!isNewUser);

    return {
        userEmail, setUserEmail,
        userPassword, setUserPassword,
        userName, setUserName,
        isNewUser, toggleMode,
        isAuthenticatingGoogle, performGoogleLogin,
        isAuthenticatingCredentials, performCredentialsLogin
    };
};
