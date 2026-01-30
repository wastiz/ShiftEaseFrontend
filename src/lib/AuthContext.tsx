"use client";

import { useGetMe } from "@/api";
import { useAuthStore } from "@/zustand/auth-state";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Loader from "@/components/ui/Loader";
import { EmployeeMeData } from "@/types";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/", "/google-callback"];
const EMPLOYEE_ROUTES = ["/overview", "/vacation", "/sick-leave", "/personal-day", "/preferences"];
const EMPLOYER_ROUTES = ["/dashboard", "/account", "/groups", "/employees", "/shift-types", "/schedules", "/organizations"];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { setUser, clearAuth, user: storedUser } = useAuthStore();
    const [isInitialized, setIsInitialized] = useState(false);

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isEmployeeRoute = EMPLOYEE_ROUTES.includes(pathname);
    const isEmployerRoute = EMPLOYER_ROUTES.includes(pathname);

    const { data, isLoading, isError } = useGetMe({
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

                if (data.role === "Employee") {
                    const employeeData = data as EmployeeMeData;
                    if (employeeData.organizationId) {
                        localStorage.setItem("orgId", String(employeeData.organizationId));
                    }
                }

                // Role-based route protection
                const userRole = data.role;
                if (userRole === "Employee" && isEmployerRoute) {
                    router.push("/overview");
                    return;
                }
                if (userRole === "Employer" && isEmployeeRoute) {
                    router.push("/dashboard");
                    return;
                }
            }

            setIsInitialized(true);
        };

        initAuth();
    }, [isLoading, isError, data, isPublicRoute, isEmployeeRoute, isEmployerRoute, pathname]);

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
