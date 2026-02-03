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
import LanguageSwitcher from "@/components/ui/inputs/LanguageSwitcher";
import NotificationWindow from "@/components/features/NotificationWindow";
import { useUnreadNotificationsCount } from "@/hooks/api/notification";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/shadcn/popover";

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
    const { state, isMobile } = useSidebar()
    const isCollapsed = state === "collapsed"
    const tCommon = useTranslations('common')
    const [notificationsOpen, setNotificationsOpen] = React.useState(false)
    const { data: unreadCount } = useUnreadNotificationsCount()

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
                    <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                        <PopoverTrigger asChild>
                            <SidebarMenuButton
                                tooltip={tCommon('notifications')}
                                className="relative"
                            >
                                <Bell />
                                <span>{tCommon('notifications')}</span>
                                {!!unreadCount && unreadCount > 0 && (
                                    <span className="absolute top-1 left-5 w-2 h-2 bg-orange-400 rounded-full" />
                                )}
                            </SidebarMenuButton>
                        </PopoverTrigger>
                        <PopoverContent
                            side={isMobile ? "top" : "right"}
                            align="end"
                            sideOffset={8}
                            className="w-auto p-0 border-0 bg-transparent shadow-none"
                        >
                            <NotificationWindow onClose={() => setNotificationsOpen(false)} />
                        </PopoverContent>
                    </Popover>
                </SidebarMenuItem>
                <NavUser user={user} />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
