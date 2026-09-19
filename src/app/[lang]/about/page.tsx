import Link from "next/link"
import { Locale } from "../../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"
import { ArrowUpRight } from "lucide-react"

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const { page } = await getDictionary(lang)
  const about = page.aboutPage

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
        {about.title}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">{about.lead}</p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{about.body}</p>
      <Link
        href={`/${lang}#products`}
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        {about.cta}
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </Link>
    </main>
  )
}
