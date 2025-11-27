"use client";

import React from "react";
import {AppSidebar} from "@/components/ui/shadcn/app-sidebar";
import {SidebarInset, SidebarProvider} from "@/components/ui/shadcn/sidebar";
import {useTranslations} from 'next-intl';

const user =  {
    name: "John Doe",
    email: "m@example.com",
    avatar: "/images/logo.svg",
}

export default function EmployerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations('nav');

    const navMain = [
        { title: t('backToOrganizations'), url: "/organizations", icon: "ArrowBigLeft" as const, isActive: true },
        { title: t('dashboard'), url: "/dashboard", icon: "LayoutDashboard" as const, isActive: true },
        { title: t('schedules'), url: "/schedules", icon: "CalendarCheck" as const },
        { title: t('employees'), url: "/employees", icon: "IdCardLanyard" as const },
        { title: t('groups'), url: "/groups", icon: "UserRound" as const },
        { title: t('shiftTypes'), url: "/shift-types", icon: "FileType" as const },
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
