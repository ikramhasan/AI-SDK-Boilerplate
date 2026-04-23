/* eslint-disable @next/next/no-img-element */

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const integrations = [
  {
    name: "Notion",
    logo: "https://svgl.app/library/notion.svg",
    connected: true,
  },
  {
    name: "Stripe",
    logo: "https://svgl.app/library/stripe.svg",
    connected: true,
  },
  {
    name: "Gmail",
    logo: "https://svgl.app/library/gmail.svg",
    connected: false,
  },
  {
    name: "Slack",
    logo: "https://svgl.app/library/slack.svg",
    connected: false,
  },
]

const steps = [
  {
    step: "01",
    title: "Connect your tools",
    description:
      "Link Gmail, Slack, Notion, your CRM, and 1000+ other apps in a few clicks. No API keys, no code.",
    visual: (
      <div className="rounded-xl border border-border">
        {integrations.map((t, i) => (
          <div key={t.name}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {t.logo ? (
                  <img src={t.logo} alt={t.name} className="size-8 rounded-lg" />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  {t.connected && (
                    <Badge variant="outline" className="text-[10px] text-green-600">
                      Connected
                    </Badge>
                  )}
                </div>
              </div>
              {t.connected ? (
                <Button variant="outline" size="sm" className="pointer-events-none text-xs">
                  Disconnect
                </Button>
              ) : (
                <Button size="sm" className="pointer-events-none text-xs">
                  Connect
                </Button>
              )}
            </div>
            {i < integrations.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    ),
  },
  {
    step: "02",
    title: "Describe what you need",
    description:
      "Tell your agent what to do in plain English. \"Summarize my meetings every Friday\" or \"Reply to support emails 24/7.\"",
    visual: (
      <div className="space-y-4">
        {/* User message — right aligned, bg-secondary, rounded-lg */}
        <div className="flex w-full max-w-[95%] flex-col gap-2 ml-auto justify-end">
          <div className="ml-auto w-fit rounded-lg bg-secondary px-4 py-3 text-sm text-foreground text-left">
            Summarize my meetings every morning and post a brief to Slack
          </div>
        </div>

        {/* Assistant message — left aligned, no background */}
        <div className="flex w-full max-w-[95%] flex-col gap-1 text-sm text-foreground text-left space-y-1">
          <p>To do this, I first need access to your Gmail and Google Calendar accounts. Please click the links below to authorize the connections:</p>
          <p>
            <a href="#" className="text-primary underline underline-offset-4 pointer-events-none">Connect Gmail</a>
          </p>
          <p>
            <a href="#" className="text-primary underline underline-offset-4 pointer-events-none">Connect Google Calendar</a>
          </p>
          <p className="text-sm">Once you have completed the authentication, let me know and I&apos;ll set up your daily morning brief!</p>
        </div>
      </div>
    ),
  },
  {
    step: "03",
    title: "Watch it work",
    description:
      "Your agent runs autonomously in a secure sandbox. Review logs, approve actions, or let it run fully hands-free.",
    visual: (
      <div className="not-prose w-full space-y-4 text-left">
        {/* Expanded content — tool steps */}
        <div className="space-y-3">
          {/* Step 1: Web Search — GlobeIcon */}
          <div className="flex gap-2 text-sm text-muted-foreground">
            <div className="relative mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <div className="absolute top-7 bottom-0 left-1/2 -mx-px w-px bg-border" />
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
              <div>Searched the web</div>
              <div className="text-muted-foreground text-xs">&quot;Stripe API revenue analytics Q1 2026&quot;</div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1 px-2 py-0.5 font-normal text-xs">stripe.com</Badge>
                <Badge variant="secondary" className="gap-1 px-2 py-0.5 font-normal text-xs">docs.stripe.com</Badge>
                <Badge variant="secondary" className="gap-1 px-2 py-0.5 font-normal text-xs">stackoverflow.com</Badge>
              </div>
            </div>
          </div>

          {/* Step 2: Remote Bash — TerminalSquareIcon */}
          <div className="flex gap-2 text-sm text-muted-foreground">
            <div className="relative mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="m4 17 6-6-6-6" />
                <path d="M12 19h8" />
              </svg>
              <div className="absolute top-7 bottom-0 left-1/2 -mx-px w-px bg-border" />
            </div>
            <div className="flex-1 space-y-1.5 overflow-hidden">
              <div>Remote Bash</div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-x-3">
                  <span>Status: <span className="text-green-600 dark:text-green-400">successful</span></span>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Command</div>
                  <pre className="scrollbar-none rounded-md bg-muted/40 p-2 text-[12px] leading-relaxed text-muted-foreground">curl -s https://api.stripe.com/v1/balance</pre>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Output</div>
                  <pre className="scrollbar-none rounded-md bg-muted/40 p-2 text-[12px] leading-relaxed text-muted-foreground">{`{ "available": [{ "amount": 766000 }] }`}</pre>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    ),
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">How it works</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Set up in minutes,{" "}
            <span className="text-primary">not months</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Unlike open-source alternatives that require VMs and complex config,
            HeyClaw is ready to go in three simple steps.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.step} className="group relative flex flex-col">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                  {step.step}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
              </div>
              <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
              <div className="mt-auto">
                {step.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
