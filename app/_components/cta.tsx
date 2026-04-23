import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTA() {
  return (
    <section className="border-t border-border/40">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-primary/5 px-6 py-16 text-center sm:px-12 md:py-20">
          {/* Background pattern */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-size-[3rem_3rem] opacity-[0.03]" />
          <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 size-60 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Ready for calmer, more
              <br />
              <span className="text-primary">productive mornings?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Join 2,400+ professionals who&apos;ve automated the busywork. Start
              free, no credit card required.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/chat">
                  Get started free
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="ml-1 size-4"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="#how-it-works">Watch a demo</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free tier includes 3 agents · 100 runs/month · No credit card
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
