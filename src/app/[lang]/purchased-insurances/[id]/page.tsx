"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, FolderOpen } from "lucide-react"
import {
  resolveApplicationById,
  type LocalApplication,
} from "@/lib/local-applications"
import { PRODUCT_VISUAL } from "@/lib/product-visuals"
import { statusChipClass } from "@/lib/status-styles"
import { Button } from "@/components/ui/button"
import { CopyReferenceButton } from "@/components/copy-reference-button"
import en from "@/dictionaries/en.json"
import fa from "@/dictionaries/fa.json"

function humanizeKey(key: string) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function flattenAnswers(
  value: unknown,
  prefix = "",
): { label: string; value: string }[] {
  if (value === undefined || value === null || value === "") return []
  if (typeof value === "boolean") {
    return [{ label: prefix || "Value", value: value ? "Yes" : "No" }]
  }
  if (typeof value !== "object" || value instanceof Date || Array.isArray(value)) {
    return [{ label: prefix || "Value", value: String(value) }]
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    flattenAnswers(nested, prefix ? `${prefix} · ${humanizeKey(key)}` : humanizeKey(key)),
  )
}

function formatEstimate(amount: number, lang: string) {
  return lang === "fa"
    ? `${amount.toLocaleString("fa-IR")} تومان`
    : `$${amount.toLocaleString("en-US")}/mo`
}

export default function PolicyDetailPage() {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "en"
  const id = typeof params?.id === "string" ? params.id : ""
  const dict = lang === "fa" ? fa : en
  const copy = dict.page.policyDetail
  const statusLabels = dict.page.policiesList.status as Record<string, string>
  const productTitles = dict.page.home.productTitles as Record<string, string>
  const [app, setApp] = useState<LocalApplication | null | undefined>(undefined)

  useEffect(() => {
    if (!id) {
      setApp(null)
      return
    }
    setApp(resolveApplicationById(id) ?? null)
  }, [id])

  const rows = useMemo(
    () => (app?.answers ? flattenAnswers(app.answers) : []),
    [app],
  )

  if (app === undefined) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-sm text-muted-foreground">{dict.page.common.loading}</p>
      </main>
    )
  }

  if (!app) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          {copy.notFound}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.notFoundBody}</p>
        <Button asChild className="mt-6">
          <Link href={`/${lang}/purchased-insurances`}>{copy.backToList}</Link>
        </Button>
      </main>
    )
  }

  const formId = app.formId ?? ""
  const visual =
    PRODUCT_VISUAL[formId] ?? {
      src: "/images/product-home.jpg",
      alt: app["Insurance Type"],
    }
  const title =
    (formId && productTitles?.[formId]) || app["Insurance Type"]
  const statusKey = app.Status
  const statusLabel = statusLabels[statusKey] ?? statusKey
  const estimate =
    typeof app.monthlyEstimate === "number"
      ? formatEstimate(app.monthlyEstimate, lang)
      : null
  const applicant =
    app.Applicant === "Demo User"
      ? dict.page.policiesList.demoApplicant
      : app.Applicant

  return (
    <main className="relative mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.14),_transparent_70%)]"
        aria-hidden
      />

      <Link
        href={`/${lang}/purchased-insurances`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
        {copy.backToList}
      </Link>

      <header className="relative overflow-hidden border border-border">
        <div className="absolute inset-0">
          <Image
            src={visual.src}
            alt=""
            fill
            className="object-cover opacity-35"
            sizes="(max-width: 768px) 100vw, 48rem"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/92 to-background" />
        </div>
        <div className="relative px-5 py-8 sm:px-8 sm:py-10">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary">
            {copy.eyebrow}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold tracking-wide ${statusChipClass(statusKey)}`}
            >
              {statusLabel}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="font-mono text-sm text-muted-foreground">{app.id}</p>
            <CopyReferenceButton
              value={app.id}
              copyLabel={copy.copyReference}
              copiedLabel={copy.copiedReference}
            />
          </div>
          {estimate ? (
            <p className="mt-5 text-sm text-muted-foreground">
              {copy.estimate}:{" "}
              <span className="font-[family-name:var(--font-display)] text-xl font-bold text-foreground">
                {estimate}
              </span>
            </p>
          ) : null}
        </div>
      </header>

      <dl className="mt-6 divide-y divide-border border border-border bg-card/60">
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr]">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {copy.applicant}
          </dt>
          <dd className="text-sm font-medium">{applicant}</dd>
        </div>
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr]">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {copy.submitted}
          </dt>
          <dd className="text-sm font-medium">{app["Submitted At"]}</dd>
        </div>
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr]">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {copy.status}
          </dt>
          <dd>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold ${statusChipClass(statusKey)}`}
            >
              {statusLabel}
            </span>
          </dd>
        </div>
        {estimate ? (
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr]">
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {copy.estimate}
            </dt>
            <dd className="text-sm font-medium">{estimate}</dd>
          </div>
        ) : null}
      </dl>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          {copy.answersTitle}
        </h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{copy.noAnswers}</p>
        ) : (
          <dl className="mt-4 divide-y divide-border border border-border bg-card/40">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid gap-1 px-5 py-3 sm:grid-cols-[12rem_1fr]"
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="text-sm font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href={`/${lang}/purchased-insurances`} className="gap-2">
            <FolderOpen className="h-4 w-4" aria-hidden />
            {copy.backToList}
          </Link>
        </Button>
        {formId ? (
          <Button asChild>
            <Link href={`/${lang}/insurance/${formId}`}>{copy.applyAgain}</Link>
          </Button>
        ) : null}
      </div>
    </main>
  )
}
