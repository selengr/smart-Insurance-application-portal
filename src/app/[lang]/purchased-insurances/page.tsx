import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { Locale } from "../../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"
import { DynamicApplicationsList } from "@/sections/application-list/dynamic-applications-list"
import { SessionContinuityBanner } from "@/components/session-continuity-banner"
import { DemoDataTools } from "@/components/demo-data-tools"
import { RecentApplications } from "@/components/recent-applications"
import { DEMO_SESSION_COOKIE } from "@/lib/auth-session"
import { buildPageMetadata } from "@/lib/page-metadata"
import { ArrowUpRight } from "lucide-react"

type Params = Promise<{ lang: Locale }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { lang } = await params
  const { page } = await getDictionary(lang)

  return buildPageMetadata({
    title: page.policies.title,
    description: page.policies.subtitle,
    lang,
    path: "/purchased-insurances",
  })
}

export default async function PurchasedInsurancesPage({
  params,
}: {
  params: Params
}) {
  const { lang } = await params
  const { page } = await getDictionary(lang)
  const jar = await cookies()
  const signedIn = jar.get(DEMO_SESSION_COOKIE)?.value === "1"

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.14),_transparent_70%)]"
        aria-hidden
      />
      <header className="mb-6 flex flex-col gap-4 border-b border-border pb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary">
            {page.home.brand}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-4xl">
            {page.policies.title}
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{page.policies.subtitle}</p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <DemoDataTools
            exportLabel={page.policies.exportLabel}
            exportEmpty={page.policies.exportEmpty}
            exportDone={page.policies.exportDone}
            importLabel={page.policies.importLabel}
            importDone={page.policies.importDone}
            importFailed={page.policies.importFailed}
            clearLabel={page.policies.clearLabel}
            clearConfirm={page.policies.clearConfirm}
            clearDone={page.policies.clearDone}
            clearCancel={page.policies.clearCancel}
          />
          <Link
            href={`/${lang}#products`}
            className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-primary hover:underline sm:self-end"
          >
            {page.home.InsuranceTypes}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </header>

      <SessionContinuityBanner
        lang={lang}
        signedIn={signedIn}
        title={page.policies.guestTitle}
        body={page.policies.guestBody}
        cta={page.policies.guestCta}
        signedInLabel={page.policies.signedInLabel}
        storageNote={page.policies.storageNote}
      />

      <RecentApplications
        lang={lang}
        title={page.policies.recentTitle}
        statusLabels={page.policiesList.status}
        productTitles={page.home.productTitles}
      />

      <DynamicApplicationsList
        lang={lang}
        labels={page.policiesList}
        productTitles={page.home.productTitles}
      />
    </div>
  )
}
