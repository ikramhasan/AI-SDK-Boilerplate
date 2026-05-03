"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { useSession } from "@better-auth-ui/react"
import { useMotionValue, useSpring, motion } from "motion/react"
import { Zap } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const motionValue = useMotionValue(value)
  const spring = useSpring(motionValue, { stiffness: 80, damping: 20 })
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  useEffect(() => {
    return spring.on("change", (latest) => {
      setDisplay(Math.round(latest))
    })
  }, [spring])

  return <motion.span className={className}>{display.toLocaleString()}</motion.span>
}

export function CreditUsageBanner() {
  const { data: session } = useSession()
  const billingStatus = useQuery(
    api.billing.getStatus,
    session ? {} : "skip"
  )

  if (!billingStatus) return null

  const { creditBalance, subscription, plans, trialExpiresAt } = billingStatus

  const activePlan = subscription
    ? plans.find((p) => p.productId === subscription.productId)
    : null

  const totalCredits = activePlan
    ? activePlan.credits
    : trialExpiresAt
      ? 100 // BILLING_TRIAL.credits
      : 0

  const isTrialOrFree = !subscription
  const creditsUsed = Math.max(0, totalCredits - creditBalance)
  const usagePercent = totalCredits > 0
    ? Math.min(100, Math.round((creditsUsed / totalCredits) * 100))
    : creditBalance <= 0
      ? 100
      : 0
  const isNearLimit = usagePercent >= 85
  const showUpgrade = isTrialOrFree || isNearLimit

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5 transition-colors",
        isNearLimit
          ? "border-red-500/30 bg-red-500/10"
          : "border-border/50 bg-muted/30"
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Credits
        </span>
        <span
          className={cn(
            "text-xs tabular-nums font-medium",
            isNearLimit ? "text-red-400" : "text-foreground"
          )}
        >
          <AnimatedNumber value={creditBalance} />
          {totalCredits > 0 && (
            <span className="text-muted-foreground">
              {" / "}
              {totalCredits.toLocaleString()}
            </span>
          )}
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isNearLimit
              ? "bg-red-500"
              : usagePercent > 60
                ? "bg-amber-500"
                : "bg-emerald-500"
          )}
          style={{ width: `${usagePercent}%` }}
        />
      </div>

      {showUpgrade && (
        <Link
          href="/settings/billing"
          className={cn(
            "mt-2 flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            isNearLimit
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          <Zap className="size-3" />
          Upgrade plan
        </Link>
      )}
    </div>
  )
}
