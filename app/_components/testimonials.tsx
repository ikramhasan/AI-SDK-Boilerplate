import { Badge } from "@/components/ui/badge"

const testimonials = [
  {
    quote:
      "HeyClaw replaced three separate tools for me. My meeting summaries, follow-ups, and CRM updates all happen automatically now.",
    name: "Sarah Chen",
    role: "Head of Sales, Meridian",
    avatar: "https://i.pravatar.cc/40?u=sarah",
  },
  {
    quote:
      "I was skeptical about AI agents, but HeyClaw's customer service bot handles 80% of our support tickets without any human intervention.",
    name: "Marcus Johnson",
    role: "Founder, ShipFast",
    avatar: "https://i.pravatar.cc/40?u=marcus",
  },
  {
    quote:
      "The multi-agent team feature is a game changer. I have a strategy agent, a content agent, and a research agent all working together on my podcast.",
    name: "Priya Patel",
    role: "Content Creator",
    avatar: "https://i.pravatar.cc/40?u=priya",
  },
  {
    quote:
      "Setting up was genuinely painless. Connected Gmail, Slack, and Linear in under 5 minutes. No API keys, no YAML files, no headaches.",
    name: "Tom Eriksson",
    role: "Engineering Lead, Volta",
    avatar: "https://i.pravatar.cc/40?u=tom",
  },
  {
    quote:
      "My daily intelligence digest is the first thing I read every morning. It curates exactly the tech news I care about with quality scores.",
    name: "Aisha Okafor",
    role: "Product Manager",
    avatar: "https://i.pravatar.cc/40?u=aisha",
  },
  {
    quote:
      "The voice agent feature is incredible. I call a number, ask about my schedule, and it reads back my day. Feels like having a real assistant.",
    name: "David Park",
    role: "CEO, NovaTech",
    avatar: "https://i.pravatar.cc/40?u=david",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Testimonials</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for people who{" "}
            <span className="text-primary">value their time</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hear from professionals who&apos;ve reclaimed hours of their week with
            HeyClaw.
          </p>
        </div>

        <div className="@container mt-12">
          <div className="@xl:grid-cols-2 grid gap-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card ring-border text-foreground space-y-3 rounded-2xl p-4 text-sm ring-1"
              >
                <div className="flex gap-3">
                  <div className="before:border-foreground/10 relative size-5 shrink-0 rounded-full before:absolute before:inset-0 before:rounded-full before:border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="rounded-full object-cover"
                      width={40}
                      height={40}
                    />
                  </div>
                  <p className="text-sm font-medium">
                    {testimonial.name}{" "}
                    <span className="text-muted-foreground ml-2 font-normal">
                      {testimonial.role}
                    </span>
                  </p>
                </div>

                <p className="text-muted-foreground text-sm">
                  {testimonial.quote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
