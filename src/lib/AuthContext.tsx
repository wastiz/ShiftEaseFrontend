"use client";

import { useGetMe } from "@/api";
import { useAuthStore } from "@/zustand/auth-state";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Loader from "@/components/ui/Loader";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/"];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { setUser, clearAuth, user: storedUser } = useAuthStore();
    const [isInitialized, setIsInitialized] = useState(false);

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    const { data, isLoading, isError, refetch } = useGetMe({
        isEnabled: !isPublicRoute,
    });

    useEffect(() => {
        const initAuth = async () => {
            if (isPublicRoute) {
                setIsInitialized(true);
                return;
            }

            // Wait for auth check to complete
            if (isLoading) return;

            if (isError || !data) {
                clearAuth();
                router.push("/sign-in");
            } else {
                setUser(data);
            }

            setIsInitialized(true);
        };

        initAuth();
    }, [isLoading, isError, data, isPublicRoute, pathname]);

    useEffect(() => {
        if (isInitialized && storedUser && isPublicRoute && pathname !== "/") {
            if (storedUser)
            router.push("/dashboard");
        }
    }, [isInitialized, storedUser, isPublicRoute, pathname]);

    if (!isInitialized || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (!isPublicRoute && !storedUser) {
        return null;
    }

    return <>{children}</>;
}
