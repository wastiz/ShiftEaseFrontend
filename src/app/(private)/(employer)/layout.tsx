import React from "react";
import {AppSidebar} from "@/components/ui/shadcn/app-sidebar";
import {SidebarInset, SidebarProvider} from "@/components/ui/shadcn/sidebar";

const user =  {
    name: "John Doe",
    email: "m@example.com",
    avatar: "/images/logo.svg",
}

const navMain = [
    { title: "Back to Organizations", url: "/organizations", icon: "ArrowBigLeft", isActive: true },
    { title: "Overview", url: "/shift-table", icon: "LayoutDashboard", isActive: true },
    { title: "Schedules", url: "/schedules", icon: "CalendarCheck" },
    { title: "Employees", url: "/employees", icon: "IdCardLanyard" },
    { title: "Groups", url: "/groups", icon: "UserRound" },
    { title: "Shift Types", url: "/shift-types", icon: "FileType" },
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
