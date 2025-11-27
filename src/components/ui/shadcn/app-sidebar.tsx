"use client"

import * as React from "react"
import {
    LayoutDashboard,
    Bell,
    UserRound,
    FileType,
    IdCardLanyard, CalendarCheck, Bolt, CalendarPlus2, TreePalm, ArrowBigLeft
} from "lucide-react"
import { useTranslations } from 'next-intl'

import { NavMain } from "@/components/ui/shadcn/nav-main"
import { NavUser } from "@/components/ui/shadcn/nav-user"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter, SidebarGroup,
    SidebarHeader, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
    SidebarRail, SidebarTrigger, useSidebar,
} from "@/components/ui/shadcn/sidebar"
import Logo from "@/components/ui/Logo";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/shadcn/collapsible";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export interface NavItem {
    title: string
    url: string
    icon?: keyof typeof iconMap
    isActive?: boolean
    items?: { title: string; url: string }[]
}

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: {
        name: string
        email: string
        avatar: string
    }
    navMain: NavItem[]
}

const iconMap = {
    LayoutDashboard,
    CalendarCheck,
    IdCardLanyard,
    UserRound,
    FileType,
    Bolt,
    CalendarPlus2,
    TreePalm,
    ArrowBigLeft
}

export function AppSidebar({ user, navMain, ...props }: AppSidebarProps) {
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"
    const tCommon = useTranslations('common')

    const mappedNavMain = navMain.map(item => ({
        ...item,
        icon: item.icon ? iconMap[item.icon] : undefined,
    }))

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <Logo variant={isCollapsed ? "small" : "big"} className="mt-3 ml-1.5" />
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mappedNavMain} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={tCommon('notifications')}>
                        <a href="/notifications">
                            <Bell />
                            <span>{tCommon('notifications')}</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <NavUser user={user} />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
