import React from "react";
import EmployerLayout from "@/components/layouts/EmployerLayout";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <EmployerLayout>{children}</EmployerLayout>;
}
