"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ChevronDownIcon, PlusIcon, CornerDownLeftIcon } from "lucide-react"

const revenueData = [
  { month: "Aug 2024", "Gross Revenue ($)": 520 },
  { month: "Sep 2024", "Gross Revenue ($)": 310 },
  { month: "Oct 2024", "Gross Revenue ($)": 380 },
  { month: "Mar 2025", "Gross Revenue ($)": 740 },
  { month: "Apr 2025", "Gross Revenue ($)": 810 },
  { month: "May 2025", "Gross Revenue ($)": 1120 },
  { month: "Jun 2025", "Gross Revenue ($)": 680 },
  { month: "Jul 2025", "Gross Revenue ($)": 590 },
  { month: "Sep 2025", "Gross Revenue ($)": 720 },
  { month: "Oct 2025", "Gross Revenue ($)": 830 },
  { month: "Apr 2026", "Gross Revenue ($)": 960 },
]

const chartConfig = {
  "Gross Revenue ($)": {
    label: "Gross Revenue ($)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function HeroMockup() {
  return (
    <div className="relative mx-auto mt-16 max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5">
        {/* Main chat area — no sidebar */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <div className="flex h-10 items-center border-b border-border px-3">
            <svg viewBox="0 0 24 24" fill="none" className="size-4 text-muted-foreground" stroke="currentColor" strokeWidth={2}>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </div>

          {/* Conversation */}
          <div className="flex flex-col gap-6 p-4">
            {/* User message — right aligned, bg-secondary, rounded-lg */}
            <div className="flex w-full max-w-[95%] flex-col gap-2 ml-auto justify-end">
              <div className="ml-auto w-fit rounded-lg bg-secondary px-4 py-3 text-sm text-foreground text-left">
                Analyze my revenue data from stripe and provide a report
              </div>
            </div>

            {/* Assistant message — left aligned, no background */}
            <div className="flex w-full max-w-[95%] flex-col gap-2">
              {/* Chain of Thought collapsible */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
                <span className="text-sm">Chain of Thought</span>
                <ChevronDownIcon className="size-3.5" />
              </div>

              {/* Report text — above the chart */}
              <div className="text-sm text-foreground text-left space-y-3">
                <h3 className="text-lg font-bold">Stripe Revenue Analysis Report</h3>
                <p className="text-sm leading-relaxed">
                  Your revenue data from <strong>Stripe</strong> has been analyzed. The primary active store is{" "}
                  <strong>SaaSKit Pro</strong>, while <strong>starter-template</strong> currently shows no sales activity.
                </p>
              </div>

              {/* Chart — using the real ChartContainer + recharts */}
              <div className="not-prose py-2">
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                  <BarChart accessibilityLayer data={revenueData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(v: string) => v.length > 8 ? v.slice(0, 8) + "…" : v}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="Gross Revenue ($)"
                      fill="var(--chart-1)"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
                <p className="mt-2 text-center text-sm font-medium text-foreground">
                  Monthly Gross Sales - SaaSKit Pro
                </p>
              </div>

              {/* Performance overview */}
              <div className="text-sm text-foreground text-left space-y-3">
                <h4 className="text-base font-semibold">1. Performance Overview (SaaSKit Pro)</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Total Revenue:</strong> $7,660.00</li>
                  <li><strong>Total Sales:</strong> 34 Orders</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Input area — matches real PromptInput structure */}
          <div className="sticky bottom-0 mt-auto w-full bg-background px-4 pb-3 pt-2">
            <div className="mx-auto overflow-hidden rounded-xl border border-input bg-background">
              <div className="min-h-[40px] px-3 py-2 text-sm text-muted-foreground text-left">
                What would you like to know?
              </div>
              <div className="flex items-center justify-between border-t border-border/50 px-2 py-1.5">
                <button className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" type="button">
                  <PlusIcon className="size-4" />
                </button>
                <button className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground" type="button">
                  <CornerDownLeftIcon className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reflection effect */}
      <div className="pointer-events-none absolute -bottom-8 left-4 right-4 h-16 rounded-2xl bg-primary/5 blur-2xl" />
    </div>
  )
}
