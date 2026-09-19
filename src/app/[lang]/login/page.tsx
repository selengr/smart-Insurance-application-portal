import { Locale } from "../../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"
import { signInDemo } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const { page } = await getDictionary(lang)

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-16">
      <div className="border border-border bg-card/80 p-8 shadow-sm">
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
      </div>
    </main>
  )
}
