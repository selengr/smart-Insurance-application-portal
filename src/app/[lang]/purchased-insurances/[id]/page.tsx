"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, FolderOpen } from "lucide-react"
import { getLocalApplicationById, type LocalApplication } from "@/lib/local-applications"
import { Button } from "@/components/ui/button"
import en from "@/dictionaries/en.json"
import fa from "@/dictionaries/fa.json"

function flattenAnswers(
  value: unknown,
  prefix = "",
): { label: string; value: string }[] {
  if (value === undefined || value === null || value === "") return []
  if (typeof value !== "object" || value instanceof Date || Array.isArray(value)) {
    return [{ label: prefix || "Value", value: String(value) }]
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    flattenAnswers(nested, prefix ? `${prefix} / ${key}` : key),
  )
}

export default function PolicyDetailPage() {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "en"
  const id = typeof params?.id === "string" ? params.id : ""
  const dict = lang === "fa" ? fa : en
  const copy = dict.page.policyDetail
  const [app, setApp] = useState<LocalApplication | null | undefined>(undefined)

  useEffect(() => {
    if (!id) {
      setApp(null)
      return
    }
    setApp(getLocalApplicationById(id) ?? null)
  }, [id])

  if (app === undefined) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-sm text-muted-foreground">{dict.page.common.loading}</p>
      </main>
    )
  }

  if (!app) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
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

  const rows = flattenAnswers(app.answers)
  const estimate =
    typeof app.monthlyEstimate === "number"
      ? lang === "fa"
        ? `${app.monthlyEstimate.toLocaleString("fa-IR")} تومان`
        : `$${app.monthlyEstimate.toLocaleString("en-US")}`
      : null

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href={`/${lang}/purchased-insurances`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
        {copy.backToList}
      </Link>

      <header className="border-b border-border pb-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight">
          {app["Insurance Type"]}
        </h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">{app.id}</p>
      </header>

      <dl className="mt-6 divide-y divide-border border border-border">
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr]">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {copy.applicant}
          </dt>
          <dd className="text-sm font-medium">{app.Applicant}</dd>
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
            <span className="inline-flex items-center bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950 dark:text-amber-200">
              {app.Status}
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
          <dl className="mt-4 divide-y divide-border border border-border">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid gap-1 px-5 py-3 sm:grid-cols-[12rem_1fr]"
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {row.label.replaceAll("_", " ")}
                </dt>
                <dd className="text-sm font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <div className="mt-8">
        <Button asChild variant="outline">
          <Link href={`/${lang}/purchased-insurances`} className="gap-2">
            <FolderOpen className="h-4 w-4" aria-hidden />
            {copy.backToList}
          </Link>
        </Button>
      </div>
    </main>
  )
}
