"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FilePenLine } from "lucide-react"

type DraftItem = {
  formId: string
  title: string
}

type Props = {
  lang: string
  products: { formId: string; title: string }[]
  title: string
  body: string
  continueLabel: string
  draftBadge: string
}

function readDrafts(products: { formId: string; title: string }[]): DraftItem[] {
  if (typeof window === "undefined") return []
  return products.filter((product) => {
    try {
      return Boolean(localStorage.getItem(`form_draft_${product.formId}`))
    } catch {
      return false
    }
  })
}

export function HomeDraftsPanel({
  lang,
  products,
  title,
  body,
  continueLabel,
  draftBadge,
}: Props) {
  const [drafts, setDrafts] = useState<DraftItem[]>([])

  useEffect(() => {
    setDrafts(readDrafts(products))
  }, [products])

  if (drafts.length === 0) return null

  return (
    <section
      className="mb-10 border border-primary/25 bg-primary/5 px-4 py-5 sm:px-6"
      aria-label={title}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {drafts.map((draft) => (
            <li key={draft.formId}>
              <Link
                href={`/${lang}/insurance/${draft.formId}`}
                className="inline-flex items-center gap-2 border border-border bg-background px-3 py-2 text-sm font-semibold transition hover:border-primary/40"
              >
                <FilePenLine className="h-4 w-4 text-primary" aria-hidden />
                <span>
                  {continueLabel} · {draft.title}
                </span>
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">
                  {draftBadge}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function ProductDraftBadge({
  formId,
  label,
}: {
  formId: string
  label: string
}) {
  const [hasDraft, setHasDraft] = useState(false)

  useEffect(() => {
    try {
      setHasDraft(Boolean(localStorage.getItem(`form_draft_${formId}`)))
    } catch {
      setHasDraft(false)
    }
  }, [formId])

  if (!hasDraft) return null

  return (
    <span className="absolute start-3 top-3 z-10 bg-background/90 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary ring-1 ring-primary/25">
      {label}
    </span>
  )
}
