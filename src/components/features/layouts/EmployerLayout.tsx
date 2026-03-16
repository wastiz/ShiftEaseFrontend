"use client";

import React from "react";
import {AppSidebar} from "@/components/ui/shadcn/app-sidebar";
import {SidebarInset, SidebarProvider} from "@/components/ui/shadcn/sidebar";
import {useTranslations} from 'next-intl';
import {useAuthStore} from "@/zustand/auth-state";

export default function EmployerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations('nav');
    const { user: userData } = useAuthStore();

    const user = {
        name: userData?.fullName || "User",
        email: userData?.email || "",
        avatar: "/images/avatar_placeholder.png",
    };

    const navMain = [
        { title: t('backToOrganizations'), url: "/organizations", icon: "ArrowBigLeft" as const, isActive: true },
        { title: t('dashboard'), url: "/dashboard", icon: "LayoutDashboard" as const, isActive: true },
        { title: t('schedules'), url: "/schedules", icon: "CalendarCheck" as const },
        { title: t('employees'), url: "/employees", icon: "IdCardLanyard" as const },
        { title: t('departments'), url: "/departments", icon: "Building2" as const },
        { title: t('shiftTemplates'), url: "/shift-templates", icon: "FileType" as const },
    ];

    return (
        <SidebarProvider>
            <AppSidebar user={user} navMain={navMain} />
            <SidebarInset className="h-screen overflow-y-auto">
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
