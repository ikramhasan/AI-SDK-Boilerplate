"use client"

import type { ComponentProps, ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function ChatAppShell({
  children,
  className,
  ...props
}: ComponentProps<typeof SidebarInset>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className={cn("flex h-dvh flex-col", className)} {...props}>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

export function ChatScreenFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="flex h-12 shrink-0 items-center px-4">
        <SidebarTrigger />
      </header>
      {children}
    </>
  )
}

export function ChatShellLoading({
  message = "Loading…",
}: {
  message?: string
}) {
  return (
    <ChatAppShell className="items-center justify-center">
      <p className="text-muted-foreground">{message}</p>
    </ChatAppShell>
  )
}
