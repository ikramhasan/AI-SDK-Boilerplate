import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, AudioLines, MessageCircle, Mic2, Plus } from "lucide-react"

const prompts = [
  "Summarize my meetings and post to Slack",
  "Analyze my Stripe revenue this quarter",
  "Draft follow-up emails for yesterday's calls",
  "Schedule social media posts for the week",
  "Monitor my servers and alert on downtime",
  "Create action items in Linear from meeting notes",
  "Track new contacts from my inbox automatically",
  "Generate a daily intelligence digest from Reddit",
  "Reply to customer DMs on WhatsApp and Instagram",
  "Validate my SaaS idea on Product Hunt and GitHub",
  "Edit my latest video — trim intro, add subtitles",
  "Paper trade prediction markets and report daily",
]

export function Hero() {
  return (
    <section className="bg-background">
      <div className="relative py-40">
        <div className="relative z-10 mx-auto w-full max-w-5xl sm:pl-6">
          <div className="flex items-center justify-between max-md:flex-col">
            <div className="max-w-md max-sm:px-6">
              <h1 className="text-balance font-serif text-4xl font-medium sm:text-5xl">
                The AI autopilot for people in hands-off mode.
              </h1>
              <p className="text-muted-foreground mt-4 text-balance">
                Deploy autonomous AI agents that handle your meetings, emails,
                social media, research, and more. 1000+ integrations, zero
                config, ready in minutes.
              </p>
              <Button asChild className="mt-6 pr-1.5">
                <Link href="/chat">
                  <span className="text-nowrap">Get started free</span>
                  <ChevronRight className="opacity-50" />
                </Link>
              </Button>
            </div>

            <div
              aria-hidden
              className="mask-y-from-50% relative max-md:mx-auto max-md:*:scale-90"
            >
              {prompts.map((prompt, index) => (
                <div
                  key={index}
                  className="text-muted-foreground flex items-center gap-2 px-14 py-2 text-sm"
                >
                  <MessageCircle className="size-3.5 opacity-50" />
                  <span className="text-nowrap">{prompt}</span>
                </div>
              ))}

              <div className="bg-card min-w-sm ring-border shadow-foreground/6.5 dark:shadow-black/6.5 absolute inset-0 m-auto mt-auto flex h-fit justify-between gap-3 rounded-full p-2 shadow-xl ring-1 sm:inset-2">
                <div className="flex items-center gap-2">
                  <div className="hover:bg-muted flex size-9 cursor-pointer rounded-full *:m-auto *:size-4">
                    <Plus />
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Ask your agent anything...
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <div className="hover:bg-muted flex size-9 cursor-pointer rounded-full *:m-auto *:size-4">
                    <Mic2 />
                  </div>
                  <div className="bg-foreground text-background flex size-9 cursor-pointer rounded-full *:m-auto *:size-4 hover:brightness-110">
                    <AudioLines />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
