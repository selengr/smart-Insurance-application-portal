import { NextPage } from "next"
import Image from "next/image"
import Link from "next/link"
import { Locale } from "../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"
import { fetchInsuranceTypes } from "@/services/api/home"
import { PRODUCT_VISUAL, productTitle } from "@/lib/product-visuals"
import { ArrowUpRight, FolderOpen } from "lucide-react"
import { HomeDraftsPanel, ProductDraftBadge } from "@/sections/home-page/home-drafts"
import { RecentApplications } from "@/components/recent-applications"

interface HomeProps {
  lang: Locale
}

type HomeDict = Awaited<ReturnType<typeof getDictionary>>["page"]["home"]

const InsurancePage: NextPage<HomeProps> = async ({ lang }) => {
  const insuranceTypes = await fetchInsuranceTypes()
  const { page } = await getDictionary(lang)
  const home = page.home as HomeDict & {
    brand: string
    emptyProducts: string
    heroCaption: string
    estimateHint?: string
    draftsTitle?: string
    draftsBody?: string
    continueDraft?: string
    draftBadge?: string
    productMeta: Record<string, string>
    productTitles?: Record<string, string>
    productHighlights?: Record<string, string[]>
  }
  const items = insuranceTypes?.data ?? []
  const draftProducts = items.map((insurance) => ({
    formId: insurance.formId,
    title:
      home.productTitles?.[insurance.formId] ?? productTitle(insurance.title),
  }))

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-14">
      <section className="relative mb-16 grid items-center gap-10 lg:mb-24 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary">
            {home.brand}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-[2.35rem] font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {home.title}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            {home.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#products"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {home.InsuranceTypes}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href={`/${lang}/purchased-insurances`}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background/70 px-5 py-3 text-sm font-semibold backdrop-blur-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <FolderOpen className="h-4 w-4" aria-hidden />
              {home.myInsurance}
            </Link>
          </div>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden border border-border/70 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)] sm:aspect-[5/4] lg:aspect-[4/3]">
          <Image
            src="/images/hero-living.jpg"
            alt={home.heroCaption}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 42vw, 100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-background/10 to-transparent" />
          <p className="absolute bottom-4 start-4 end-4 text-sm font-medium text-foreground">
            {home.heroCaption}
          </p>
        </div>
      </section>

      <HomeDraftsPanel
        lang={lang}
        products={draftProducts}
        title={home.draftsTitle ?? "Continue a draft"}
        body={
          home.draftsBody ??
          "Pick up where you left off — drafts stay in this browser until you reserve."
        }
        continueLabel={home.continueDraft ?? "Continue"}
        draftBadge={home.draftBadge ?? "Draft"}
      />

      <RecentApplications
        lang={lang}
        title={page.policies.recentTitle}
        statusLabels={page.policiesList.status}
        productTitles={home.productTitles}
      />

      <section id="products" aria-labelledby="products-heading" className="scroll-mt-28">
        <div className="mb-7 flex items-end justify-between gap-4 border-b border-border pb-3">
          <h2
            id="products-heading"
            className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-3xl"
          >
            {home.InsuranceTypes}
          </h2>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {String(items.length).padStart(2, "0")}
          </span>
        </div>

        {items.length === 0 ? (
          <div
            className="border border-dashed border-border p-10 text-center text-muted-foreground"
            role="status"
          >
            {home.emptyProducts}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {items.map((insurance) => {
              const visual =
                PRODUCT_VISUAL[insurance.formId] ?? {
                  src: "/images/product-home.jpg",
                  alt: insurance.title,
                }
              const blurb = home.productMeta?.[insurance.formId]
              const highlights = home.productHighlights?.[insurance.formId] ?? []

              return (
                <li key={insurance.formId}>
                  <Link
                    href={`/${lang}/insurance/${insurance.formId}`}
                    className="group relative flex h-full flex-col overflow-hidden border border-border bg-card/80 transition duration-300 hover:-translate-y-1 hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`${home.InsuranceLink}: ${insurance.title}`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                      <ProductDraftBadge
                        formId={insurance.formId}
                        label={home.draftBadge ?? "Draft"}
                      />
                      <Image
                        src={visual.src}
                        alt={visual.alt}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                      <div>
                        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold leading-snug">
                          {home.productTitles?.[insurance.formId] ??
                            productTitle(insurance.title)}
                        </h3>
                        {blurb ? (
                          <p className="mt-1.5 text-sm text-muted-foreground">{blurb}</p>
                        ) : null}
                        {highlights.length > 0 ? (
                          <ul className="mt-3 space-y-1.5">
                            {highlights.map((line) => (
                              <li
                                key={line}
                                className="flex items-start gap-2 text-xs leading-snug text-muted-foreground"
                              >
                                <span
                                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary"
                                  aria-hidden
                                />
                                {line}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                      <div className="mt-auto space-y-2">
                        {home.estimateHint ? (
                          <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
                            {home.estimateHint}
                          </p>
                        ) : null}
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                          {home.InsuranceLink}
                          <ArrowUpRight
                            className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            aria-hidden
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default InsurancePage
