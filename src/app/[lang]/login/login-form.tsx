"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from "@/lib/demo-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginCopy = {
  cta: string
  hint: string
  orDivider: string
  emailLabel: string
  passwordLabel: string
  nameLabel: string
  signInCta: string
  registerCta: string
  toggleToRegister: string
  toggleToSignIn: string
  errorInvalid: string
  errorExists: string
  errorWeakPassword: string
  errorGeneric: string
}

// Sign-in runs client-side via next-auth/react's signIn({ redirect: false })
// rather than a server action: calling NextAuth's Credentials provider from
// a Server Action bound to a <form action> got stuck on the
// /api/auth/callback/credentials redirect in testing, a known rough edge of
// next-auth@5 betas. This path is the one documented as reliable for a
// custom credentials UI.
export function LoginForm({ lang, copy }: { lang: string; copy: LoginCopy }) {
  const router = useRouter()
  const [mode, setMode] = useState<"signin" | "register">("signin")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function goToPolicies() {
    router.push(`/${lang}/purchased-insurances`)
    router.refresh()
  }

  async function handleDemo() {
    setPending(true)
    setError(null)
    const res = await signIn("credentials", {
      email: DEMO_USER_EMAIL,
      password: DEMO_USER_PASSWORD,
      redirect: false,
    })
    setPending(false)
    if (res?.error) {
      setError(copy.errorGeneric)
      return
    }
    goToPolicies()
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const formData = new FormData(event.currentTarget)
    const res = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
    })
    setPending(false)
    if (res?.error) {
      setError(copy.errorInvalid)
      return
    }
    goToPolicies()
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")
    const name = String(formData.get("name") ?? "").trim()

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined }),
    })

    if (!response.ok) {
      setPending(false)
      if (response.status === 409) setError(copy.errorExists)
      else setError(copy.errorWeakPassword)
      return
    }

    const res = await signIn("credentials", { email, password, redirect: false })
    setPending(false)
    if (res?.error) {
      setError(copy.errorInvalid)
      return
    }
    goToPolicies()
  }

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void handleDemo()
        }}
        className="mt-8 space-y-3"
      >
        <Button type="submit" className="w-full" disabled={pending}>
          {copy.cta}
        </Button>
        <p className="text-xs text-muted-foreground">{copy.hint}</p>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden />
        {copy.orDivider}
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {mode === "register" ? (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{copy.nameLabel}</Label>
            <Input id="name" name="name" type="text" autoComplete="name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="register-email">{copy.emailLabel}</Label>
            <Input
              id="register-email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="register-password">{copy.passwordLabel}</Label>
            <Input
              id="register-password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">{copy.errorWeakPassword}</p>
          </div>
          <Button type="submit" variant="outline" className="w-full" disabled={pending}>
            {copy.registerCta}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="signin-email">{copy.emailLabel}</Label>
            <Input
              id="signin-email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signin-password">{copy.passwordLabel}</Label>
            <Input
              id="signin-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" variant="outline" className="w-full" disabled={pending}>
            {copy.signInCta}
          </Button>
        </form>
      )}

      <button
        type="button"
        onClick={() => {
          setMode((current) => (current === "register" ? "signin" : "register"))
          setError(null)
        }}
        className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
      >
        {mode === "register" ? copy.toggleToSignIn : copy.toggleToRegister}
      </button>
    </>
  )
}
