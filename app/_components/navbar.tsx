import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-5 text-primary-foreground"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">HeyClaw</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="#how-it-works">How it works</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="#use-cases">Use cases</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="#integrations">Integrations</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="#testimonials">Testimonials</Link>
          </Button>
        </nav>

        <Button size="sm" asChild>
          <Link href="/chat">Get started free</Link>
        </Button>
      </div>
    </header>
  )
}
