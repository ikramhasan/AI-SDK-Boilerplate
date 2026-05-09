import { viewPaths } from "@better-auth-ui/react/core"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Auth } from "@/components/auth/auth"
import { TermsDisclosure } from "@/components/auth/terms-disclosure"

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>
}) {
  const { path } = await params

  if (!Object.values(viewPaths.auth).includes(path)) {
    notFound()
  }

  return (
    <main className="relative grid min-h-svh overflow-hidden bg-background text-foreground lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden min-h-svh border-r border-border/60 bg-[linear-gradient(135deg,var(--background)_0%,var(--muted)_100%)] px-10 py-10 lg:flex lg:flex-col">
        <Link href="/" className="flex w-fit items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_12px_40px_-18px_var(--primary)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-5"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2 2 7l10 5 10-5-10-5Z" />
              <path d="m2 17 10 5 10-5" />
              <path d="m2 12 10 5 10-5" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight">HeyClaw</span>
        </Link>

        <div className="flex flex-1 items-center">
          <div className="max-w-xl">
            <p className="mb-5 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-foreground ring-1 ring-primary/25 dark:text-primary">
              AI workspace for shipping faster
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-balance">
              Bring your chats, tools, and context into one focused workspace.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-pretty text-muted-foreground">
              Sign in to continue building with your connected models,
              integrations, and saved conversations.
            </p>

            <div className="mt-10 grid max-w-lg gap-4 border-l border-border/70 pl-5">
              {[
                "Connected tool workflows",
                "Persistent project context",
                "Private account controls",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="size-3"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 10 3 3 7-7" />
                    </svg>
                  </span>
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-svh flex-col items-center justify-center px-4 py-8 sm:px-6">
        <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-5"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2 2 7l10 5 10-5-10-5Z" />
              <path d="m2 17 10 5 10-5" />
              <path d="m2 12 10 5 10-5" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight">HeyClaw</span>
        </Link>

        <div className="w-full max-w-[29rem]">
          <Auth path={path} socialLayout="vertical" socialPosition="top" />
          <TermsDisclosure
            view={path === viewPaths.auth.signUp ? "signUp" : undefined}
          />
        </div>
      </section>
    </main>
  )
}
