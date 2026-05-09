"use client"

import Link from "next/link"
import {
  ArrowRight,
  Check,
  Coins,
  CreditCard,
  Search,
  Sparkles,
  Zap,
} from "lucide-react"

import {
  BILLING_INTERVAL,
  BILLING_CREDIT_VALUE_USD,
  BILLING_TRIAL,
  SUBSCRIPTION_PLANS,
  TOOL_PRICING,
  type BillingInterval,
} from "@/lib/billing"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const planEntries = Object.values(SUBSCRIPTION_PLANS).filter(
  (plan) => plan.name !== "Basic"
)

const creditExamples = [
  {
    icon: Sparkles,
    label: "AI generation",
    value: "Measured from model cost",
    detail: "A normal chat charges only the credits needed for the tokens used.",
  },
  {
    icon: Search,
    label: "Web research",
    value: `${TOOL_PRICING.tavilySearch.basic.credits}-${TOOL_PRICING.tavilySearch.advanced.credits} credits`,
    detail: "Search, extraction, and research tools are counted per action.",
  },
  {
    icon: Zap,
    label: "Lightweight tools",
    value: "Often 0-4 credits",
    detail: "Calculators, dates, charts, and image search stay inexpensive.",
  },
]

function formatCurrency(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value)
}

function PlanCard({
  plan,
  interval,
  featured = false,
}: {
  plan: (typeof planEntries)[number]
  interval: BillingInterval
  featured?: boolean
}) {
  const creditValue = plan.credits * BILLING_CREDIT_VALUE_USD
  const isYearly = interval === BILLING_INTERVAL.yearly

  return (
    <div
      className={[
        "relative flex h-full flex-col rounded-3xl bg-card p-5 shadow-sm ring-1 transition-shadow hover:shadow-lg",
        featured
          ? "ring-primary/40 shadow-primary/10"
          : "ring-border/70 hover:shadow-foreground/5",
      ].join(" ")}
    >
      {featured && (
        <Badge className="absolute right-5 top-5 rounded-full">
          Most popular
        </Badge>
      )}

      <div className="pr-24">
        <h3 className="font-serif text-2xl font-medium">{plan.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {plan.credits.toLocaleString()} credits for chats, tools, and
          autonomous agent runs.
        </p>
      </div>

      <div className="mt-6">
        <div className="flex items-end gap-1">
          <span className="font-serif text-4xl font-medium tabular-nums">
            {formatCurrency(plan.monthlyPriceUsd)}
          </span>
          <span className="pb-1 text-sm text-muted-foreground">/mo</span>
        </div>
        {isYearly ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Billed yearly at {formatCurrency(plan.priceUsd)}. You save 20%.
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            Month to month, cancel anytime.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-muted/45 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Included credits</span>
          <span className="text-sm font-semibold tabular-nums">
            {plan.credits.toLocaleString()}
          </span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Worth {formatCurrency(creditValue)} in included app usage{" "}
          {isYearly ? "each year" : "each month"}.
        </p>
      </div>

      <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
        <li className="flex gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
          Credits refresh each billing period
        </li>
        <li className="flex gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
          Use any supported model or connected tool
        </li>
        <li className="flex gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
          Start with {BILLING_TRIAL.credits} free trial credits first
        </li>
      </ul>

      <Button className="mt-6 h-11 w-full active:scale-[0.96]" asChild>
        <Link href="/settings/billing">
          Start with {plan.name}
          <ArrowRight className="size-4 opacity-60" />
        </Link>
      </Button>
    </div>
  )
}

function PricingGrid({ interval }: { interval: BillingInterval }) {
  const visiblePlans = planEntries.filter((plan) => plan.interval === interval)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {visiblePlans.map((plan) => (
        <PlanCard
          key={plan.name}
          plan={plan}
          interval={interval}
          featured={plan.name === "Plus"}
        />
      ))}
    </div>
  )
}

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <Badge variant="outline" className="mb-4">
              Pricing
            </Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Start free, then scale with{" "}
              <span className="text-primary">clear credit packs</span>
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              Every plan includes a credit balance for AI generation, research
              tools, and connected actions. New users get{" "}
              {BILLING_TRIAL.credits} free credits for {BILLING_TRIAL.days} days
              with no credit card required.
            </p>
          </div>

          <div className="rounded-3xl bg-muted/35 p-5 ring-1 ring-border/60">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-background text-primary ring-1 ring-border/70">
                <CreditCard className="size-5" />
              </div>
              <div>
                <p className="font-medium">Free trial included</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Try real agent work with {BILLING_TRIAL.credits} credits. No
                  setup fee, no card, no surprise overages.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue={BILLING_INTERVAL.yearly} className="mt-12">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <TabsList className="h-11">
              <TabsTrigger value={BILLING_INTERVAL.monthly} className="px-5">
                Monthly
              </TabsTrigger>
              <TabsTrigger value={BILLING_INTERVAL.yearly} className="px-5">
                Yearly
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  20% off
                </span>
              </TabsTrigger>
            </TabsList>
            <p className="text-sm text-muted-foreground">
              1 credit = {formatCurrency(BILLING_CREDIT_VALUE_USD, 2)} of app
              usage.
            </p>
          </div>

          <TabsContent value={BILLING_INTERVAL.monthly} className="mt-8">
            <PricingGrid interval={BILLING_INTERVAL.monthly} />
          </TabsContent>
          <TabsContent value={BILLING_INTERVAL.yearly} className="mt-8">
            <PricingGrid interval={BILLING_INTERVAL.yearly} />
          </TabsContent>
        </Tabs>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {creditExamples.map((example) => (
            <div
              key={example.label}
              className="rounded-3xl bg-muted/30 p-5 ring-1 ring-border/60"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-background text-primary ring-1 ring-border/70">
                  <example.icon className="size-5" />
                </div>
                <div>
                  <p className="font-medium">{example.label}</p>
                  <p className="text-sm font-semibold text-primary">
                    {example.value}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {example.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-3xl bg-card p-5 ring-1 ring-border/70 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Coins className="size-5" />
            </div>
            <div>
              <p className="font-medium">Credits are simple on purpose</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Larger plans give you more room for longer chats, deeper
                research, file-heavy workflows, and autonomous runs.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-11 shrink-0 active:scale-[0.96]"
            asChild
          >
            <Link href="/settings/billing">
              Try {BILLING_TRIAL.credits} credits free
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
