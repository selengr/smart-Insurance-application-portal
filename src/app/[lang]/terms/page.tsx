import Link from "next/link"
import { Locale } from "../../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const { page } = await getDictionary(lang)

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
        {page.legal.termsTitle}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {page.legal.termsBody}
      </p>
      <Link
        href={`/${lang}`}
        className="mt-8 inline-block text-sm text-primary underline-offset-4 hover:underline"
      >
        {page.legal.backHome}
      </Link>
    </main>
  )
}
