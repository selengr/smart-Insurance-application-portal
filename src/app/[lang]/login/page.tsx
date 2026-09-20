import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Locale } from "../../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"
import { signInDemo } from "@/lib/auth-actions"
import { DEMO_SESSION_COOKIE } from "@/lib/auth-session"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const jar = await cookies()
  if (jar.get(DEMO_SESSION_COOKIE)?.value === "1") {
    redirect(`/${lang}/purchased-insurances`)
  }

  const { page } = await getDictionary(lang)

  return (
    <main className="relative mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-16">
      <div
        className="pointer-events-none absolute inset-x-0 -top-8 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.16),_transparent_70%)]"
        aria-hidden
      />
      <Link
        href={`/${lang}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
        {page.login.backHome}
      </Link>
      <div className="border border-border bg-card/80 p-8">
        <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary">
          {page.home.brand}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          {page.login.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {page.login.subtitle}
        </p>
        <form action={signInDemo.bind(null, lang)} className="mt-8 space-y-3">
          <Button type="submit" className="w-full">
            {page.login.cta}
          </Button>
          <p className="text-xs text-muted-foreground">{page.login.hint}</p>
        </form>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          {page.login.trust}
        </p>
        <Link
          href={`/${lang}/purchased-insurances`}
          className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
        >
          {page.login.viewPolicies}
        </Link>
      </div>
    </main>
  )
}
