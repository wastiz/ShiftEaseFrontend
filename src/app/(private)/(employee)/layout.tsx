import React from "react";
import {AppSidebar} from "@/components/ui/shadcn/app-sidebar";
import {SidebarInset, SidebarProvider} from "@/components/ui/shadcn/sidebar";

const user = {
    name: "John Doe",
    email: "m@example.com",
    avatar: "/images/logo.svg",
};

const navMain = [
    { title: "Dashboard", url: "/", icon: "LayoutDashboard", isActive: true },
    { title: "Preferences", url: "/preferences", icon: "Bolt" },
    { title: "Sick Leave", url: "/sick-leave", icon: "CalendarPlus2" },
    { title: "Vacation", url: "/vacation", icon: "TreePalm" },
];

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <AppSidebar user={user} navMain={navMain} />
            <SidebarInset className="h-screen overflow-y-auto">
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
