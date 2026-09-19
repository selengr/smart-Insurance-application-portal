import { NextPage } from "next"
import Image from "next/image"
import Link from "next/link"
import { Locale } from "../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"
import { fetchInsuranceTypes } from "@/services/api/home"
import { ArrowUpRight, FolderOpen } from "lucide-react"

interface HomeProps {
  lang: Locale
}

const PRODUCT_VISUAL: Record<string, { src: string; alt: string }> = {
  health_insurance_application: { src: "/icons/health.png", alt: "Health coverage" },
  home_insurance_application: { src: "/icons/home.png", alt: "Home coverage" },
  car_insurance_application: { src: "/icons/car.png", alt: "Car coverage" },
}

const InsurancePage: NextPage<HomeProps> = async ({ lang }) => {
  const insuranceTypes = await fetchInsuranceTypes()
  const { page } = await getDictionary(lang)
  const items = insuranceTypes?.data ?? []
  const isFa = lang === "fa"

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
      {/* Hero — one composition: brand, line, support, CTA */}
      <section className="relative mb-14 grid gap-8 lg:mb-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-12">
        <div className={isFa ? "text-right" : "text-left"}>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Smart Insurance Portal
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            {page.home.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {page.home.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#products"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {page.home.InsuranceTypes}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href={`/${lang}/purchased-insurances`}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background/60 px-5 py-3 text-sm font-semibold backdrop-blur-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <FolderOpen className="h-4 w-4" aria-hidden />
              {page.home.myInsurance}
            </Link>
          </div>
        </div>

        <div className="relative hidden min-h-[280px] overflow-hidden rounded-sm border border-border/70 lg:block">
          <Image
            src="/icons/home2.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 40vw, 100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <p className="absolute bottom-4 start-4 end-4 text-sm font-medium text-foreground/90">
            {page.home.InsuranceLink}
          </p>
        </div>
      </section>

      {/* Products — interaction containers only */}
      <section id="products" aria-labelledby="products-heading" className="scroll-mt-24">
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-3">
          <h2
            id="products-heading"
            className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-3xl"
          >
            {page.home.InsuranceTypes}
          </h2>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {items.length || "—"}
          </span>
        </div>

        {items.length === 0 ? (
          <div
            className="border border-dashed border-border p-10 text-center text-muted-foreground"
            role="status"
          >
            No insurance products available right now.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {items.map((insurance, index) => {
              const visual =
                PRODUCT_VISUAL[insurance.formId] ?? {
                  src: "/icons/check.svg",
                  alt: insurance.title,
                }

              return (
                <li
                  key={insurance.formId}
                  className={index === 0 ? "sm:col-span-2 lg:col-span-1" : undefined}
                >
                  <Link
                    href={`/${lang}/insurance/${insurance.formId}`}
                    className="group relative flex h-full min-h-[220px] flex-col overflow-hidden border border-border bg-card/70 transition duration-300 hover:-translate-y-1 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`${page.home.InsuranceLink}: ${insurance.title}`}
                  >
                    <div className="relative h-36 w-full overflow-hidden bg-muted">
                      <Image
                        src={visual.src}
                        alt={visual.alt}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                      <h3 className="font-[family-name:var(--font-display)] text-xl font-bold leading-snug">
                        {insurance.title}
                      </h3>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        {page.home.InsuranceLink}
                        <ArrowUpRight
                          className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden
                        />
                      </span>
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
