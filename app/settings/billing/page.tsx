"use client"

import { CheckoutLink, CustomerPortalLink } from "@convex-dev/polar/react"
import { useQuery } from "convex/react"
import { CheckIcon, CreditCardIcon, ExternalLinkIcon } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { SettingsPageShell } from "@/components/settings-page-shell"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { BILLING_TRIAL, POLAR_METADATA_KEYS } from "@/lib/billing"

function formatDate(value: number | string | null | undefined) {
  if (!value) return "Not available"
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(value)
}

export default function BillingPage() {
  const status = useQuery(api.billing.getStatus)

  return (
    <SettingsPageShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
            <p className="text-sm text-muted-foreground">
              Manage your subscription and credit balance.
            </p>
          </div>

          {status?.subscription ? (
            <CustomerPortalLink
              polarApi={api.billing}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <ExternalLinkIcon />
              Customer portal
            </CustomerPortalLink>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCardIcon className="size-4" />
                Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-semibold tabular-nums">
                {status ? status.creditBalance.toLocaleString() : "—"}
              </div>
              <Progress
                value={(() => {
                  if (!status) return 0
                  const activePlan = status.subscription
                    ? status.plans.find(
                        (p) => p.productId === status.subscription?.productId
                      )
                    : null
                  const max = activePlan?.credits ?? BILLING_TRIAL.credits
                  return Math.min(100, (status.creditBalance / max) * 100)
                })()}
              />
              <p className="text-xs text-muted-foreground">
                Credits remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold">
                  {status?.subscription?.product?.name ?? "Trial"}
                </span>
                <Badge variant="outline">
                  {status?.subscription?.status ?? "trial"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Renews {formatDate(status?.subscription?.currentPeriodEnd)}
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Plans</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {status?.plans.map((plan) => {
              const isActivePlan =
                status.subscription?.productId === plan.productId
              const hasSubscription = !!status.subscription

              return (
                <Card
                  key={plan.key}
                  className={cn(
                    isActivePlan &&
                      "ring-2 ring-primary"
                  )}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        {plan.name}
                        {isActivePlan && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckIcon className="mr-1 size-3" />
                            Current
                          </Badge>
                        )}
                      </span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {formatMoney(plan.priceUsd)}/mo
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <span className="font-medium tabular-nums">
                        {plan.credits.toLocaleString()}
                      </span>{" "}
                      included credits
                    </div>
                    {isActivePlan ? (
                      <CustomerPortalLink
                        polarApi={api.billing}
                        className={cn(
                          buttonVariants({ variant: "outline", className: "w-full" })
                        )}
                      >
                        <ExternalLinkIcon className="mr-1 size-4" />
                        Manage Subscription
                      </CustomerPortalLink>
                    ) : hasSubscription ? (
                      <CustomerPortalLink
                        polarApi={api.billing}
                        className={cn(
                          buttonVariants({ variant: "secondary", className: "w-full" })
                        )}
                      >
                        <ExternalLinkIcon className="mr-1 size-4" />
                        Change Plan
                      </CustomerPortalLink>
                    ) : plan.productId ? (
                      <CheckoutLink
                        polarApi={api.billing}
                        productIds={[plan.productId]}
                        metadata={{
                          [POLAR_METADATA_KEYS.userId]: status.billingUserId,
                        }}
                        embed={false}
                        lazy
                        className={cn(buttonVariants({ className: "w-full" }))}
                      >
                        Choose {plan.name}
                      </CheckoutLink>
                    ) : (
                      <div className="rounded-md border border-dashed px-3 py-2 text-center text-xs text-muted-foreground">
                        Missing product ID
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>


      </div>
    </SettingsPageShell>
  )
}
