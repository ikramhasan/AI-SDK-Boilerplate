"use client"

import { useAuth } from "@better-auth-ui/react"
import type { AuthView } from "@better-auth-ui/react/core"

export function TermsDisclosure({ view }: { view?: AuthView }) {
  const { emailAndPassword, socialProviders, Link } = useAuth()

  const hasSocialSignUp = !!socialProviders?.length
  const shouldShow =
    view === "signUp" || (!emailAndPassword?.enabled && hasSocialSignUp)

  if (!shouldShow) {
    return null
  }

  return (
    <p className="mx-auto mt-5 max-w-sm text-center text-xs leading-5 text-muted-foreground">
      By signing up, you agree to our{" "}
      <Link
        href="/terms"
        className="font-medium text-foreground underline-offset-4 hover:underline"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        href="/privacy-policy"
        className="font-medium text-foreground underline-offset-4 hover:underline"
      >
        Privacy Policy
      </Link>
      .
    </p>
  )
}
