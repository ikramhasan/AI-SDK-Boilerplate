"use client"

import { useSession } from "@better-auth-ui/react"
import { useQuery } from "convex/react"
import type { User } from "better-auth"

import { api } from "@/convex/_generated/api"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { UserAvatar } from "./user-avatar"

export type UserViewProps = {
  className?: string
  isPending?: boolean
  /** @remarks `User` */
  user?: User & { username?: string | null; displayUsername?: string | null }
}

/**
 * Render a compact user item with an avatar, a primary label (display username, name, or email), and the user's current plan.
 *
 * @param isPending - If true and no `user` prop is provided, renders a loading skeleton instead of user details
 * @param className - Additional CSS classes applied to the outer container
 * @param user - Optional user object to display; when omitted the current session user is used
 * @returns A React element showing the user's avatar with their identifying information
 */
export function UserView({ className, isPending, user }: UserViewProps) {
  const { data: session, isPending: sessionPending } = useSession({
    enabled: !user && !isPending
  })

  const resolvedUser = user ?? session?.user

  const billingStatus = useQuery(
    api.billing.getStatus,
    session && !user ? {} : "skip"
  )

  const planLabel = billingStatus?.subscription
    ? billingStatus.plans.find(
        (p) => p.productId === billingStatus.subscription?.productId
      )?.name ?? "Subscribed"
    : billingStatus?.trialExpiresAt
      ? "Trial"
      : "Free"

  if ((isPending || sessionPending) && !user) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <UserAvatar isPending />

        <div className="grid flex-1 gap-1 text-left text-sm">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <UserAvatar user={resolvedUser} />

      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium text-foreground">
          {resolvedUser?.displayUsername ||
            resolvedUser?.name ||
            resolvedUser?.email}
        </span>

        {(resolvedUser?.displayUsername || resolvedUser?.name) && (
          <span className="text-muted-foreground truncate text-xs">
            {billingStatus !== undefined ? `${planLabel} plan` : resolvedUser?.email}
          </span>
        )}
      </div>
    </div>
  )
}
