"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  getRecentApplications,
  type LocalApplication,
} from "@/lib/local-applications"
import { statusChipClass } from "@/lib/status-styles"
import { ArrowUpRight } from "lucide-react"

type Props = {
  lang: string
  title: string
  statusLabels: Record<string, string>
  productTitles?: Record<string, string>
}

export function RecentApplications({
  lang,
  title,
  statusLabels,
  productTitles,
}: Props) {
  const [items, setItems] = useState<LocalApplication[]>([])

  useEffect(() => {
    setItems(getRecentApplications(4))
    const refresh = () => setItems(getRecentApplications(4))
    window.addEventListener("sip:applications-changed", refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener("sip:applications-changed", refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  if (items.length === 0) return null

  return (
    <section className="mb-6" aria-label={title}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">{title}</h2>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((app) => {
          const titleLabel =
            (app.formId && productTitles?.[app.formId]) || app["Insurance Type"]
          const statusKey = String(app.Status)
          return (
            <li key={app.id}>
              <Link
                href={`/${lang}/purchased-insurances/${app.id}`}
                className="flex items-center justify-between gap-3 border border-border bg-card/60 px-4 py-3 transition hover:border-primary/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{titleLabel}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{app.id}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-[0.65rem] font-semibold ${statusChipClass(statusKey)}`}
                  >
                    {statusLabels[statusKey] ?? statusKey}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-primary" aria-hidden />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
