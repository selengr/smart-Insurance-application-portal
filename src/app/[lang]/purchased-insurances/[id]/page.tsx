"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, FolderOpen, Sparkles } from "lucide-react"
import {
  advanceApplicationStatus,
  isLocalOwnedApplication,
  nextStatus,
  resolveApplicationById,
  trackRecentApplication,
  type LocalApplication,
  type StatusEvent,
} from "@/lib/local-applications"
import { productVisual } from "@/lib/product-visuals"
import { statusChipClass } from "@/lib/status-styles"
import { Button } from "@/components/ui/button"
import { CopyReferenceButton } from "@/components/copy-reference-button"
import { ShareLinkButton } from "@/components/share-link-button"
import en from "@/dictionaries/en.json"
import fa from "@/dictionaries/fa.json"
import { toast } from "sonner"
import { formatMonthlyEstimate } from "@/lib/format-money"

function humanizeKey(key: string) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function flattenAnswers(
  value: unknown,
  labels: { yes: string; no: string; valueLabel: string },
  prefix = "",
): { label: string; value: string }[] {
  if (value === undefined || value === null || value === "") return []
  if (typeof value === "boolean") {
    return [
      {
        label: prefix || labels.valueLabel,
        value: value ? labels.yes : labels.no,
      },
    ]
  }
  if (typeof value !== "object" || value instanceof Date || Array.isArray(value)) {
    return [{ label: prefix || labels.valueLabel, value: String(value) }]
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    flattenAnswers(
      nested,
      labels,
      prefix ? `${prefix} · ${humanizeKey(key)}` : humanizeKey(key),
    ),
  )
}

function formatWhen(iso: string, lang: string) {
  try {
    return new Date(iso).toLocaleString(lang === "fa" ? "fa-IR" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

export default function PolicyDetailPage() {
  const params = useParams()
  const queryClient = useQueryClient()
  const lang = typeof params?.lang === "string" ? params.lang : "en"
  const id = typeof params?.id === "string" ? params.id : ""
  const dict = lang === "fa" ? fa : en
  const copy = dict.page.policyDetail
  const statusLabels = dict.page.policiesList.status as Record<string, string>
  const productTitles = dict.page.home.productTitles as Record<string, string>
  const currency = {
    perMonth: dict.page.common.perMonthSuffix,
    toman: dict.page.common.tomanSuffix,
  }
  const [app, setApp] = useState<LocalApplication | null | undefined>(undefined)
  const [localOwned, setLocalOwned] = useState(false)

  useEffect(() => {
    if (!id) {
      setApp(null)
      setLocalOwned(false)
      return
    }
    setApp(resolveApplicationById(id) ?? null)
    setLocalOwned(isLocalOwnedApplication(id))
    trackRecentApplication(id)
  }, [id])

  const rows = useMemo(
    () =>
      app?.answers
        ? flattenAnswers(app.answers, {
            yes: copy.yes,
            no: copy.no,
            valueLabel: copy.valueLabel,
          })
        : [],
    [app, copy.yes, copy.no, copy.valueLabel],
  )

  const history: StatusEvent[] = app?.statusHistory?.length
    ? app.statusHistory
    : app
      ? [{ status: app.Status as StatusEvent["status"], at: app.reservedAt ?? `${app["Submitted At"]}T12:00:00.000Z` }]
      : []

  const upcoming = app ? nextStatus(app.Status) : null

  const onAdvance = () => {
    if (!id || !upcoming) return
    const updated = advanceApplicationStatus(id)
    if (!updated) return
    setApp(updated)
    void queryClient.invalidateQueries({ queryKey: ["purchased-insurances"] })
    toast.success(copy.advancedTitle, {
      description: copy.advancedBody.replace(
        "{status}",
        statusLabels[updated.Status] ?? updated.Status,
      ),
    })
  }

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
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          {copy.notFoundRecover}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href={`/${lang}/purchased-insurances`}>{copy.backToList}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${lang}#products`}>{copy.applyAgain}</Link>
          </Button>
        </div>
      </main>
    )
  }

  const formId = app.formId ?? ""
  const title =
    (formId && productTitles?.[formId]) || app["Insurance Type"]
  const visual = productVisual(formId, title)
  const statusKey = app.Status
  const statusLabel = statusLabels[statusKey] ?? statusKey
  const estimate =
    typeof app.monthlyEstimate === "number"
      ? formatMonthlyEstimate(app.monthlyEstimate, lang, currency)
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
            <ShareLinkButton
              path={`/${lang}/purchased-insurances/${app.id}`}
              copyLabel={copy.shareLink}
              copiedLabel={copy.shareLinkDone}
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

      <section className="mt-6 border border-border bg-card/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
            {copy.timelineTitle}
          </h2>
          {localOwned && upcoming ? (
            <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={onAdvance}>
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {copy.advanceStatus.replace(
                "{status}",
                statusLabels[upcoming] ?? upcoming,
              )}
            </Button>
          ) : null}
        </div>
        <ol className="mt-5 space-y-4">
          {history.map((event, index) => (
            <li key={`${event.status}-${event.at}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    index === history.length - 1 ? "bg-primary" : "bg-muted-foreground/50"
                  }`}
                />
                {index < history.length - 1 ? (
                  <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
                ) : null}
              </div>
              <div className="pb-1">
                <p className="text-sm font-semibold">
                  {statusLabels[event.status] ?? event.status}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatWhen(event.at, lang)}
                </p>
              </div>
            </li>
          ))}
        </ol>
        {localOwned && upcoming ? (
          <p className="mt-4 text-xs text-muted-foreground">{copy.advanceHint}</p>
        ) : null}
      </section>

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
