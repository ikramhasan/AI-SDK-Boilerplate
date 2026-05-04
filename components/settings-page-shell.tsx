"use client";

import type { ReactNode } from "react";
import { useSession } from "@better-auth-ui/react";
import { useQuery } from "convex/react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";

export function SettingsPageShell({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session);
  const isAdmin = useQuery(
    api.adminUsers.hasAdminPermission,
    isAuthenticated ? {} : "skip"
  );

  return (
    <SidebarProvider>
      {isAdmin ? <AdminSidebar /> : <AppSidebar />}
      <SidebarInset className="flex h-dvh flex-col">
        <header className="flex h-12 shrink-0 items-center px-4">
          <SidebarTrigger />
          <span className="ml-2 text-sm font-medium text-muted-foreground">
            Settings
          </span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl p-4 md:p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
