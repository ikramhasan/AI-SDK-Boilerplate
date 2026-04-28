"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { CommandMenu } from "@/components/command-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/lib/query-provider";
import { authClient } from "@/lib/auth-client";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your .env file");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function AppProviders({
  children,
  initialToken,
}: {
  children: ReactNode;
  initialToken?: string | null;
}) {
  return (
    <TooltipProvider>
      <ConvexBetterAuthProvider
        client={convex}
        authClient={authClient}
        initialToken={initialToken}
      >
        <QueryProvider>
          <ThemeProvider>
            <AuthUiProvider>
              <CommandMenu />
              {children}
              <Toaster />
            </AuthUiProvider>
          </ThemeProvider>
        </QueryProvider>
      </ConvexBetterAuthProvider>
    </TooltipProvider>
  );
}

function AuthUiProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return (
    <AuthProvider
      authClient={authClient}
      appearance={{ theme, setTheme }}
      emailAndPassword={{ enabled: false }}
      multiSession={false}
      redirectTo="/chat"
      socialProviders={["google"]}
      navigate={({ to, replace }) =>
        replace ? router.replace(to) : router.push(to)
      }
      Link={Link}
    >
      {children}
    </AuthProvider>
  );
}
