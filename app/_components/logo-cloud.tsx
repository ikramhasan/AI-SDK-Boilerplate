/* eslint-disable @next/next/no-img-element */

const logos = [
  { name: "Gmail", src: "https://svgl.app/library/gmail.svg" },
  { name: "Slack", src: "https://svgl.app/library/slack.svg" },
  { name: "Notion", src: "https://svgl.app/library/notion.svg" },
  { name: "Linear", src: "https://svgl.app/library/linear.svg" },
  { name: "Google Calendar", src: "https://svgl.app/library/google-calendar.svg" },
  { name: "Salesforce", src: "https://svgl.app/library/salesforce.svg" },
  { name: "GitHub", src: "https://svgl.app/library/github_light.svg" },
  { name: "Jira", src: "https://svgl.app/library/atlassian.svg" },
]

export function LogoCloud() {
  return (
    <section className="border-y border-border/40 bg-muted/30 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
          Connects to the tools you already use — no code required
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center gap-2 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
            >
              <img
                src={logo.src}
                alt={logo.name}
                className="h-6 w-auto"
                loading="lazy"
              />
              <span className="text-sm font-medium text-muted-foreground">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
