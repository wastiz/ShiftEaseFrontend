'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEmployerGoogleLogin } from '@/api/auth';
import Loader from '@/components/ui/Loader';

export default function GoogleCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const googleLogin = useEmployerGoogleLogin();
    const [error, setError] = useState<string | null>(null);
    const calledRef = useRef(false);

    useEffect(() => {
        if (calledRef.current) return;

        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setError(`Google authentication was cancelled or failed: ${errorParam}`);
            setTimeout(() => router.push('/sign-in'), 3000);
            return;
        }

        if (!code) {
            setError('No authorization code received from Google.');
            setTimeout(() => router.push('/sign-in'), 3000);
            return;
        }

        calledRef.current = true;

        const redirectUri = `${window.location.origin}/google-callback`;

        const performLogin = async () => {
            try {
                await googleLogin.mutateAsync({ code, redirectUri });
                router.push('/organizations');
            } catch (err: any) {
                const errorData = err?.response?.data;
                const message =
                    errorData?.message ||
                    errorData?.title ||
                    (errorData?.errors && Array.isArray(errorData.errors)
                        ? errorData.errors.join(', ')
                        : null) ||
                    'Google authentication failed';
                setError(message);
                setTimeout(() => router.push('/sign-in'), 3000);
            }
        };

        performLogin();
    }, [searchParams]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            {error ? (
                <div className="text-center">
                    <p className="text-red-500 mb-2">{error}</p>
                    <p className="text-muted-foreground text-sm">Redirecting to sign in...</p>
                </div>
            ) : (
                <div className="text-center flex flex-col items-center gap-4">
                    <Loader />
                    <p className="text-muted-foreground text-sm">Completing Google sign-in...</p>
                </div>
            )}
        </div>
    );
}
