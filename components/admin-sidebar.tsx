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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Settings02Icon,
  UserIcon,
  Logout03Icon,
  MessageMultiple02Icon,
  UserMultiple02Icon,
  ArrowLeft01Icon,
  ChatFeedbackIcon,
  ChartLineData03Icon,
  AiBrain05Icon,
} from "@hugeicons/core-free-icons"
import { useClerk, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getSiteName } from "@/lib/site-data"

export function AdminSidebar() {
  const { user, isLoaded } = useUser()
  const { signOut, openUserProfile } = useClerk()
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
              <Link href="/">
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
        {isLoaded && user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="h-auto p-2">
                <Avatar size="sm">
                  <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />
                  <AvatarFallback>
                    {user.firstName?.charAt(0) ?? ""}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm font-medium">
                  {user.fullName}
                </span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-(--radix-dropdown-menu-trigger-width)"
            >
              <DropdownMenuLabel className="flex items-center gap-2 font-normal">
                <Avatar size="sm">
                  <AvatarImage
                    src={user.imageUrl}
                    alt={user.fullName ?? ""}
                  />
                  <AvatarFallback>
                    {user.firstName?.charAt(0) ?? ""}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm">{user.fullName}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => openUserProfile()}>
                <HugeiconsIcon icon={UserIcon} size={16} />
                Manage Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => signOut()}>
                <HugeiconsIcon icon={Logout03Icon} size={16} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
