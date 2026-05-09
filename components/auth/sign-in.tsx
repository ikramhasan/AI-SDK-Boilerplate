"use client"

import {
  useAuth,
  useSendVerificationEmail,
  useSignInEmail,
  useSignInUsername,
} from "@better-auth-ui/react"
import { type SyntheticEvent, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { MagicLinkButton } from "./magic-link-button"
import { PasskeyButton } from "./passkey-button"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type SignInProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * Render the sign-in form UI with email/password, magic link, and social provider options.
 *
 * @param className - Optional additional container class names
 * @param socialLayout - Layout style for social provider buttons
 * @param socialPosition - Position of social provider buttons; `"top"` or `"bottom"`. Defaults to `"bottom"`.
 * @returns The rendered sign-in UI as a JSX element
 */
export function SignIn({
  className,
  socialLayout,
  socialPosition = "bottom",
}: SignInProps) {
  const {
    basePaths,
    baseURL,
    emailAndPassword,
    localization,
    magicLink,
    passkey,
    redirectTo,
    socialProviders,
    username: usernameConfig,
    viewPaths,
    navigate,
    Link,
  } = useAuth()

  const [password, setPassword] = useState("")

  const { mutate: sendVerificationEmail } = useSendVerificationEmail({
    onSuccess: () => toast.success(localization.auth.verificationEmailSent),
  })

  const { mutate: signInEmail, isPending: signInEmailPending } = useSignInEmail(
    {
      onError: (error, { email }) => {
        setPassword("")

        if (error.error?.code === "EMAIL_NOT_VERIFIED") {
          toast.error(error.error?.message || error.message, {
            action: {
              label: localization.auth.resend,
              onClick: () =>
                sendVerificationEmail({
                  email,
                  callbackURL: `${baseURL}${redirectTo}`,
                }),
            },
          })
        } else {
          toast.error(error.error?.message || error.message)
        }
      },
      onSuccess: () => navigate({ to: redirectTo }),
    }
  )

  const { mutate: signInUsername, isPending: signInUsernamePending } =
    useSignInUsername({
      onError: (error) => {
        setPassword("")
        toast.error(error.error?.message || error.message)
      },
      onSuccess: () => navigate({ to: redirectTo }),
    })

  const isPending = signInEmailPending || signInUsernamePending

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const rememberMe = formData.get("rememberMe") === "on"

    if (usernameConfig?.enabled && !isEmail(email)) {
      signInUsername({
        username: email,
        password,
      })
    } else {
      signInEmail({
        email,
        password,
        ...(emailAndPassword?.rememberMe ? { rememberMe } : {}),
      })
    }
  }

  const showSeparator =
    emailAndPassword?.enabled && socialProviders && socialProviders.length > 0

  return (
    <Card
      className={cn(
        "w-full border-0 bg-card/95 py-7 shadow-[0_24px_90px_-40px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.08)_inset] ring-1 ring-foreground/10 backdrop-blur-xl",
        className
      )}
    >
      <CardHeader className="gap-2 px-7">
        <CardTitle className="text-2xl font-semibold tracking-tight text-balance">
          {localization.auth.signIn}
        </CardTitle>
        <CardDescription className="leading-6 text-pretty">
          Continue to your HeyClaw workspace.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-7">
        <div className="flex flex-col gap-5">
          {socialPosition === "top" && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons
                  socialLayout={socialLayout}
                  isPending={isPending}
                />
              )}

              {showSeparator && (
                <FieldSeparator className="m-0 flex items-center text-xs *:data-[slot=field-separator-content]:bg-card/95">
                  {localization.auth.or}
                </FieldSeparator>
              )}
            </>
          )}

          {emailAndPassword?.enabled && (
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-4">
                <Field data-invalid={!!fieldErrors.email}>
                  <Label htmlFor="email">
                    {usernameConfig?.enabled
                      ? localization.auth.username
                      : localization.auth.email}
                  </Label>

                  <Input
                    id="email"
                    name="email"
                    type={usernameConfig?.enabled ? "text" : "email"}
                    autoComplete={
                      usernameConfig?.enabled ? "username email" : "email"
                    }
                    placeholder={
                      usernameConfig?.enabled
                        ? localization.auth.usernameOrEmailPlaceholder
                        : localization.auth.emailPlaceholder
                    }
                    required
                    disabled={isPending}
                    onChange={() => {
                      setFieldErrors((prev) => ({
                        ...prev,
                        email: undefined,
                      }))
                    }}
                    onInvalid={(e) => {
                      e.preventDefault()

                      setFieldErrors((prev) => ({
                        ...prev,
                        email: (e.target as HTMLInputElement).validationMessage,
                      }))
                    }}
                    aria-invalid={!!fieldErrors.email}
                  />

                  <FieldError>{fieldErrors.email}</FieldError>
                </Field>

                <Field data-invalid={!!fieldErrors.password}>
                  <Label htmlFor="password">{localization.auth.password}</Label>

                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)

                      setFieldErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }))
                    }}
                    placeholder={localization.auth.passwordPlaceholder}
                    required
                    minLength={emailAndPassword?.minPasswordLength}
                    maxLength={emailAndPassword?.maxPasswordLength}
                    disabled={isPending}
                    onInvalid={(e) => {
                      e.preventDefault()

                      setFieldErrors((prev) => ({
                        ...prev,
                        password: (e.target as HTMLInputElement)
                          .validationMessage,
                      }))
                    }}
                    aria-invalid={!!fieldErrors.password}
                  />

                  <FieldError>{fieldErrors.password}</FieldError>
                </Field>

                {emailAndPassword.rememberMe && (
                  <Field className="my-1">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="rememberMe"
                        name="rememberMe"
                        disabled={isPending}
                      />

                      <Label
                        htmlFor="rememberMe"
                        className="cursor-pointer text-sm font-normal"
                      >
                        {localization.auth.rememberMe}
                      </Label>
                    </div>
                  </Field>
                )}

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="h-11 transition-transform active:scale-[0.96]"
                    disabled={isPending}
                  >
                    {isPending && <Spinner />}

                    {localization.auth.signIn}
                  </Button>

                  {magicLink && (
                    <MagicLinkButton view="signIn" isPending={isPending} />
                  )}

                  {passkey && <PasskeyButton isPending={isPending} />}
                </div>
              </FieldGroup>
            </form>
          )}

          {socialPosition === "bottom" && (
            <>
              {showSeparator && (
                <FieldSeparator className="flex items-center text-xs *:data-[slot=field-separator-content]:bg-card/95">
                  {localization.auth.or}
                </FieldSeparator>
              )}

              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons
                  socialLayout={socialLayout}
                  isPending={isPending}
                />
              )}
            </>
          )}
        </div>

        {emailAndPassword?.enabled && (
          <div className="mt-5 flex w-full flex-col items-center gap-3 border-t border-border/60 pt-5">
            {emailAndPassword.forgotPassword && (
              <Link
                href={`${basePaths.auth}/${viewPaths.auth.forgotPassword}`}
                className="self-center text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {localization.auth.forgotPasswordLink}
              </Link>
            )}

            <FieldDescription className="text-center leading-6">
              {localization.auth.needToCreateAnAccount}{" "}
              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {localization.auth.signUp}
              </Link>
            </FieldDescription>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
