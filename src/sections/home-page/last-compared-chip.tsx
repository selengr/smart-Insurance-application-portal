"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { GitCompareArrows } from "lucide-react"
import {
  parseCompareParam,
  readCompareSession,
  serializeCompareParam,
  subscribeCompareSession,
} from "@/lib/compare-url"

type Props = {
  lang: string
  titles: Record<string, string>
  label: string
  vs: string
}

function pairFromSession(knownIds: string[]): [string, string] | null {
  const raw = readCompareSession()
  if (raw == null || raw === ",") return null
  const [left, right] = parseCompareParam(raw, knownIds)
  if (!left || !right || left === right) return null
  return [left, right]
}

export function LastComparedChip({ lang, titles, label, vs }: Props) {
  const knownIds = useMemo(() => Object.keys(titles), [titles])
  const [pair, setPair] = useState<[string, string] | null>(null)

  const refresh = useCallback(() => {
    setPair(pairFromSession(knownIds))
  }, [knownIds])

  useEffect(() => {
    refresh()
    return subscribeCompareSession(refresh)
  }, [refresh])

  if (!pair) return null

  const [leftId, rightId] = pair
  const leftTitle = titles[leftId] ?? leftId
  const rightTitle = titles[rightId] ?? rightId
  const query = serializeCompareParam(leftId, rightId)
  const href = `/${lang}?compare=${query}#compare`

  return (
    <Link
      href={href}
      className="inline-flex max-w-full items-center gap-2 border border-border/80 bg-background/70 px-3 py-2 text-xs font-semibold text-foreground backdrop-blur-sm transition hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <GitCompareArrows className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
      <span className="truncate">
        <span className="text-muted-foreground">{label}</span>
        <span className="mx-1.5 text-muted-foreground/70" aria-hidden>
          ·
        </span>
        <span>
          {leftTitle} {vs} {rightTitle}
        </span>
      </span>
    </Link>
  )
}
