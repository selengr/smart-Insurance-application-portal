import type { Metadata } from "next"
import Link from "next/link"
import { Locale } from "../../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"
import { buildPageMetadata } from "@/lib/page-metadata"

type Params = Promise<{ lang: Locale }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { lang } = await params
  const { page } = await getDictionary(lang)

  return buildPageMetadata({
    title: page.legal.termsTitle,
    description: page.legal.termsBody,
    lang,
    path: "/terms",
  })
}

export default async function TermsPage({
  params,
}: {
  params: Params
}) {
  const { lang } = await params
  const { page } = await getDictionary(lang)
  const legal = page.legal
  const sections = [
    { title: legal.aboutDemo, body: legal.termsAbout },
    { title: legal.demoUse, body: legal.termsUse },
    { title: legal.limitations, body: legal.termsLimits },
  ]

  return (
    <main className="relative mx-auto w-full max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.14),_transparent_70%)]"
        aria-hidden
      />
      <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary">
        {page.home.brand}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-4xl">
        {legal.termsTitle}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{legal.termsBody}</p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="border-t border-border pt-6">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              {section.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      <Link
        href={`/${lang}`}
        className="mt-10 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        {legal.backHome}
      </Link>
    </main>
  )
}
