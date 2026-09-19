import Link from "next/link"
import { Locale } from "../../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"
import { DynamicApplicationsList } from "@/sections/application-list/dynamic-applications-list"
import { ArrowUpRight } from "lucide-react"

export default async function PurchasedInsurancesPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const { page } = await getDictionary(lang)

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.14),_transparent_70%)]"
        aria-hidden
      />
      <header className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary">
            {page.home.brand}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-4xl">
            {page.policies.title}
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{page.policies.subtitle}</p>
        </div>
        <Link
          href={`/${lang}#products`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          {page.home.InsuranceTypes}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </header>
      <DynamicApplicationsList
        lang={lang}
        labels={page.policiesList}
        productTitles={page.home.productTitles}
      />
    </div>
  )
}
