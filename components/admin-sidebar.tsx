"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Settings02Icon,
  MessageMultiple02Icon,
  UserMultiple02Icon,
  ArrowLeft01Icon,
  ChatFeedbackIcon,
  ChartLineData03Icon,
  AiBrain05Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getSiteName } from "@/lib/site-data"
import { UserButton } from "@/components/user/user-button"

export function AdminSidebar() {
  const pathname = usePathname()
  const siteName = getSiteName()
  const navItems = [
    {
      title: siteName,
      href: "/admin",
      icon: Settings02Icon,
    },
    {
      title: "Models",
      href: "/admin/models",
      icon: AiBrain05Icon,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: UserMultiple02Icon,
    },
    {
      title: "Chats",
      href: "/admin/chats",
      icon: MessageMultiple02Icon,
    },
    {
      title: "Feedbacks",
      href: "/admin/feedbacks",
      icon: ChatFeedbackIcon,
    },
    {
      title: "Usage",
      href: "/admin/usage",
      icon: ChartLineData03Icon,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Back to app" asChild>
              <Link href="/chat">
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
                <span>Back to app</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={pathname === item.href}
                    asChild
                  >
                    <Link href={item.href}>
                      <HugeiconsIcon icon={item.icon} size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <UserButton align="start" sideOffset={8} className="w-full" />
      </SidebarFooter>
    </Sidebar>
  )
}
