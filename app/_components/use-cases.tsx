"use client"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const categories = [
  {
    id: "business",
    label: "Business & Productivity",
    cases: [
      {
        title: "Meeting Intelligence",
        description:
          "Turn transcripts into structured summaries and auto-assign action items in Jira, Linear, or Todoist.",
        tags: ["Google Meet", "Linear", "Todoist"],
        mockup: (
          <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium">Sprint Planning — Apr 21</span>
              <Badge variant="secondary" className="text-[10px]">Auto-generated</Badge>
            </div>
            <div className="space-y-1.5 text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>Migrate auth provider — assigned to <b className="text-foreground">@sarah</b></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-chart-2" />
                <span>Update pricing page copy — assigned to <b className="text-foreground">@mike</b></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-chart-3" />
                <span>Review Q2 metrics dashboard — assigned to <b className="text-foreground">@alex</b></span>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "AI Customer Service",
        description:
          "Unify WhatsApp, Instagram, and Email into a single AI-powered inbox with 24/7 automated responding.",
        tags: ["WhatsApp", "Instagram", "Gmail"],
        mockup: (
          <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
            <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
              <span className="size-6 rounded-full bg-green-100 text-center leading-6 text-[10px]">WA</span>
              <div className="flex-1">
                <p className="font-medium">Order #4821 — shipping?</p>
                <p className="text-muted-foreground">Auto-replied 2m ago</p>
              </div>
              <Badge variant="default" className="text-[10px]">Resolved</Badge>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
              <span className="size-6 rounded-full bg-pink-100 text-center leading-6 text-[10px]">IG</span>
              <div className="flex-1">
                <p className="font-medium">Product availability DM</p>
                <p className="text-muted-foreground">Awaiting approval</p>
              </div>
              <Badge variant="outline" className="text-[10px]">Pending</Badge>
            </div>
          </div>
        ),
      },
      {
        title: "Personal CRM",
        description:
          "Auto-track contacts from email and calendar, manage follow-ups via natural language.",
        tags: ["Gmail", "Calendar", "HubSpot"],
        mockup: (
          <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-violet-100 text-[10px] font-medium">JD</div>
                <div>
                  <p className="font-medium">Jane Doe</p>
                  <p className="text-muted-foreground">Last contact: 3 days ago</p>
                </div>
              </div>
              <span className="text-amber-500 text-[10px] font-medium">Follow up</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-sky-100 text-[10px] font-medium">BK</div>
                <div>
                  <p className="font-medium">Bob Kim</p>
                  <p className="text-muted-foreground">Meeting tomorrow 2pm</p>
                </div>
              </div>
              <span className="text-green-500 text-[10px] font-medium">On track</span>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: "social",
    label: "Social & Content",
    cases: [
      {
        title: "Content Pipelines",
        description:
          "From video idea scouting and research to generating show notes and social promo assets for podcasts and YouTube.",
        tags: ["YouTube", "X", "Notion"],
        mockup: (
          <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium">Pipeline: Weekly Podcast</span>
              <Badge variant="secondary" className="text-[10px]">Running</Badge>
            </div>
            <div className="space-y-1">
              {["Research trending topics", "Draft show notes", "Generate social cards", "Schedule posts"].map((step, i) => (
                <div key={step} className="flex items-center gap-2 text-muted-foreground">
                  <span className={`size-4 rounded-full flex items-center justify-center text-[8px] ${i < 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {i < 2 ? "✓" : i + 1}
                  </span>
                  <span className={i < 2 ? "line-through opacity-50" : ""}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title: "Social Media Autopilot",
        description:
          "Use natural language to schedule posts, reply to DMs, and analyze account performance across X and Reddit.",
        tags: ["X", "Reddit", "Analytics"],
        mockup: (
          <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-background p-2">
                <p className="text-lg font-bold text-primary">12.4k</p>
                <p className="text-muted-foreground">Impressions</p>
              </div>
              <div className="rounded-lg bg-background p-2">
                <p className="text-lg font-bold text-chart-2">847</p>
                <p className="text-muted-foreground">Engagements</p>
              </div>
              <div className="rounded-lg bg-background p-2">
                <p className="text-lg font-bold text-chart-3">6.8%</p>
                <p className="text-muted-foreground">Rate</p>
              </div>
            </div>
            <div className="rounded-lg bg-background px-3 py-2 text-muted-foreground">
              3 posts scheduled for this week · 2 DMs auto-replied
            </div>
          </div>
        ),
      },
      {
        title: "AI Video Editing",
        description:
          "Edit videos — trim, crop, color grade, and add subtitles — simply by describing the changes you want.",
        tags: ["YouTube", "Premiere", "Captions"],
        mockup: (
          <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
            <div className="rounded-lg bg-background px-3 py-2">
              <p className="text-muted-foreground mb-1">Your instruction:</p>
              <p>&quot;Trim the first 10 seconds, add subtitles, and color grade to warm tones&quot;</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-primary" />
              <span className="text-muted-foreground">100%</span>
            </div>
            <p className="text-muted-foreground">✓ Exported to Google Drive</p>
          </div>
        ),
      },
    ],
  },
  {
    id: "research",
    label: "Research & Knowledge",
    cases: [
      {
        title: "Market Idea Validator",
        description:
          "Scan GitHub, npm, and Product Hunt to validate business ideas before you build them.",
        tags: ["GitHub", "Product Hunt", "npm"],
        mockup: (
          <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
            <div className="font-medium">Idea: &quot;AI meeting summarizer&quot;</div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
                <span>Existing competitors</span>
                <span className="font-medium text-amber-500">14 found</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
                <span>GitHub stars (top 5)</span>
                <span className="font-medium text-primary">23.4k avg</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
                <span>Market gap score</span>
                <span className="font-medium text-green-500">7.2 / 10</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Searchable Second Brain",
        description:
          "Text your bot any thought or link to save it into a searchable, vector-powered knowledge base.",
        tags: ["WhatsApp", "Notion", "Vector DB"],
        mockup: (
          <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
            <div className="rounded-lg bg-background px-3 py-2">
              <p className="text-muted-foreground">You texted:</p>
              <p>&quot;Great article on RAG patterns — save this&quot;</p>
            </div>
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-primary">
              ✓ Saved to Knowledge Base · Tagged: #ai #rag #architecture
            </div>
            <p className="text-muted-foreground">247 items in your second brain</p>
          </div>
        ),
      },
      {
        title: "Daily Intelligence Digests",
        description:
          "Get curated, quality-scored summaries of tech news, subreddits, and YouTube channels delivered daily.",
        tags: ["Reddit", "YouTube", "Slack"],
        mockup: (
          <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium">Morning Digest — Apr 23</span>
              <Badge variant="secondary" className="text-[10px]">8 items</Badge>
            </div>
            <div className="space-y-1">
              {[
                { title: "GPT-5 rumors gain traction", score: "9.2" },
                { title: "New React compiler RFC", score: "8.7" },
                { title: "Rust 2.0 roadmap published", score: "8.1" },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-lg bg-background px-3 py-1.5">
                  <span className="truncate">{item.title}</span>
                  <span className="shrink-0 text-primary font-medium">{item.score}</span>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: "finance",
    label: "Finance & Ops",
    cases: [
      {
        title: "Market Autopilot",
        description:
          "Automated tracking and paper trading on prediction markets with detailed daily performance reports.",
        tags: ["Analytics", "Slack", "Sheets"],
        mockup: (
          <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-background p-2 text-center">
                <p className="text-lg font-bold text-green-500">+12.3%</p>
                <p className="text-muted-foreground">This week</p>
              </div>
              <div className="rounded-lg bg-background p-2 text-center">
                <p className="text-lg font-bold text-primary">$2,847</p>
                <p className="text-muted-foreground">Paper P&L</p>
              </div>
            </div>
            <div className="rounded-lg bg-background px-3 py-2 text-muted-foreground">
              Daily report sent to #trading-log at 6pm
            </div>
          </div>
        ),
      },
      {
        title: "Self-Healing Infrastructure",
        description:
          "Monitor and repair home or business servers autonomously via secure SSH agents.",
        tags: ["SSH", "Slack", "PagerDuty"],
        mockup: (
          <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-green-600">
              <span className="size-1.5 rounded-full bg-green-500" />
              All 3 servers healthy
            </div>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex items-center justify-between rounded-lg bg-background px-3 py-1.5">
                <span>prod-api-01</span>
                <span className="text-green-500">99.9% uptime</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background px-3 py-1.5">
                <span>prod-db-01</span>
                <span className="text-green-500">99.8% uptime</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background px-3 py-1.5">
                <span>prod-worker-01</span>
                <span className="text-amber-500">Auto-restarted 2h ago</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Voice-Activated Assistance",
        description:
          "Access your entire HeyClaw agent suite via standard phone calls for hands-free productivity on the go.",
        tags: ["Phone", "Twilio", "All agents"],
        mockup: (
          <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
            <div className="flex items-center gap-3 rounded-lg bg-background px-3 py-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <svg viewBox="0 0 24 24" fill="none" className="size-5 text-primary" stroke="currentColor" strokeWidth={2}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Call +1 (555) 0123</p>
                <p className="text-muted-foreground">&quot;What&apos;s on my calendar today?&quot;</p>
              </div>
            </div>
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-primary text-center">
              Voice agent active · Avg response: 1.2s
            </div>
          </div>
        ),
      },
    ],
  },
]

export function UseCases() {
  return (
    <section id="use-cases" className="border-t border-border/40 bg-muted/20 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Use cases</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What can your AI agents{" "}
            <span className="text-primary">actually do?</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From automating your inbox to managing prediction markets — HeyClaw
            agents handle the work so you can focus on what matters.
          </p>
        </div>

        <Tabs defaultValue="business" className="mt-12">
          <div className="flex justify-center">
            <TabsList className="h-auto flex-wrap">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs sm:text-sm">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="mt-8">
              <div className="grid gap-6 md:grid-cols-3">
                {cat.cases.map((useCase) => (
                  <Card key={useCase.title} className="shadow-sm transition-shadow hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-base">{useCase.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {useCase.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {useCase.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>{useCase.mockup}</CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
