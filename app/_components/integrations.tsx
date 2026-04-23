/* eslint-disable @next/next/no-img-element */

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const integrationRows = [
  [
    { name: "Gmail", icon: "https://svgl.app/library/gmail.svg" },
    { name: "Outlook", icon: "https://svgl.app/library/microsoft-outlook.svg" },
    { name: "Slack", icon: "https://svgl.app/library/slack.svg" },
    { name: "Teams", icon: "https://svgl.app/library/microsoft-teams.svg" },
    { name: "Discord", icon: "https://svgl.app/library/discord.svg" },
    { name: "WhatsApp", icon: "https://svgl.app/library/whatsapp-icon.svg" },
    { name: "Telegram", icon: "https://svgl.app/library/telegram.svg" },
    { name: "Notion", icon: "https://svgl.app/library/notion.svg" },
    { name: "Google Drive", icon: "https://svgl.app/library/drive.svg" },
    { name: "Dropbox", icon: "https://svgl.app/library/dropbox.svg" },
  ],
  [
    { name: "GitHub", icon: "https://svgl.app/library/github_light.svg" },
    { name: "Linear", icon: "https://svgl.app/library/linear.svg" },
    { name: "Jira", icon: "https://svgl.app/library/atlassian.svg" },
    { name: "Asana", icon: "https://svgl.app/library/asana-logo.svg" },
    { name: "Salesforce", icon: "https://svgl.app/library/salesforce.svg" },
    { name: "Stripe", icon: "https://svgl.app/library/stripe.svg" },
    { name: "Shopify", icon: "https://svgl.app/library/shopify.svg" },
    { name: "Supabase", icon: "https://svgl.app/library/supabase.svg" },
    { name: "Firebase", icon: "https://svgl.app/library/firebase.svg" },
  ],
  [
    { name: "X", icon: "https://svgl.app/library/x.svg" },
    { name: "Reddit", icon: "https://svgl.app/library/reddit.svg" },
    { name: "Instagram", icon: "https://svgl.app/library/instagram-icon.svg" },
    { name: "YouTube", icon: "https://svgl.app/library/youtube.svg" },
    { name: "TikTok", icon: "https://svgl.app/library/tiktok-icon-light.svg" },
    { name: "LinkedIn", icon: "https://svgl.app/library/linkedin.svg" },
    { name: "Calendar", icon: "https://svgl.app/library/google-calendar.svg" },
    { name: "Sheets", icon: "https://svgl.app/library/google-sheets.svg" },
    { name: "Todoist", icon: "https://svgl.app/library/todoist.svg" },
    { name: "Zoom", icon: "https://svgl.app/library/zoom.svg" },
  ],
]

export function Integrations() {
  return (
    <section id="integrations" className="border-t border-border/40 bg-muted/20 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Integrations</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-primary">1000+</span> integrations,{" "}
            zero config
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            HeyClaw connects to every tool in your stack.
            Just authenticate and go.
          </p>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {integrationRows.flat().map((integration) => (
            <div
              key={integration.name}
              className="group flex items-center gap-2.5 rounded-2xl border border-border/60 bg-card px-4 py-2.5 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            >
              <img
                src={integration.icon}
                alt={integration.name}
                className="size-5 object-contain"
                loading="lazy"
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {integration.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            And thousands more — Airtable, Pipedrive, Twilio, Google Docs, Figma, Canva...
          </p>
          <Button variant="outline" asChild>
            <Link href="/integrations" className="gap-2">
              Browse all integrations
              <svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
