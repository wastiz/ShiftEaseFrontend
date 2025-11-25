"use client";

import React from "react";
import {AppSidebar} from "@/components/ui/shadcn/app-sidebar";
import {SidebarInset, SidebarProvider} from "@/components/ui/shadcn/sidebar";
import {useTranslations} from 'next-intl';

const user = {
    name: "John Doe",
    email: "m@example.com",
    avatar: "/images/logo.svg",
};

export default function EmployeeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations('nav');

    const navMain = [
        { title: t('dashboard'), url: "/dashboard", icon: "LayoutDashboard" as const, isActive: true },
        { title: t('preferences'), url: "/preferences", icon: "Bolt" as const },
        { title: t('sickLeave'), url: "/sick-leave", icon: "CalendarPlus2" as const },
        { title: t('vacation'), url: "/vacation", icon: "TreePalm" as const },
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
