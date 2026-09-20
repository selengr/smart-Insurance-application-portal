"use client"

import { useParams } from "next/navigation"
import en from "@/dictionaries/en.json"
import fa from "@/dictionaries/fa.json"

export default function Loading() {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "en"
  const loading = (lang === "fa" ? fa : en).page.common.loading

  return (
    <div
      className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16"
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-x-0 -top-8 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.16),_transparent_70%)]"
        aria-hidden
      />
      <div className="animate-pulse space-y-6">
        <div className="h-3 w-28 rounded bg-primary/20" />
        <div className="h-10 w-2/5 max-w-sm rounded bg-muted" />
        <div className="h-4 w-3/5 max-w-lg rounded bg-muted/80" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-52 border border-border/60 bg-card/50" />
          <div className="h-52 border border-border/60 bg-card/50" />
          <div className="h-52 border border-border/60 bg-card/50" />
        </div>
      </div>
      <span className="sr-only">{loading}</span>
    </div>
  )
}
