"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import { ArrowLeftRight, ArrowUpRight, Check, Link2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  readCompareSession,
  resolveComparePair,
  serializeCompareParam,
  writeCompareSession,
} from "@/lib/compare-url"

export type CompareProduct = {
  formId: string
  title: string
  blurb: string
  highlights: string[]
  imageSrc: string
  imageAlt: string
}

type Copy = {
  title: string
  body: string
  pickA: string
  pickB: string
  selectPlaceholder: string
  empty: string
  apply: string
  swap: string
  clear: string
  vs: string
  copyLink: string
  copiedLink: string
  copyHint: string
}

type Props = {
  lang: string
  products: CompareProduct[]
  copy: Copy
}

export function ProductCompare({ lang, products, copy }: Props) {
  const baseId = useId()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const knownIds = useMemo(() => products.map((p) => p.formId), [products])
  const defaults = useMemo((): [string, string] => {
    if (products.length < 2) return ["", ""]
    return [products[0].formId, products[1].formId]
  }, [products])

  const compareRaw = searchParams.get("compare")
  const hasCompareParam = searchParams.has("compare")
  // undefined = not hydrated yet (treat as no session → defaults)
  const [sessionRaw, setSessionRaw] = useState<string | null | undefined>(
    undefined,
  )
  const [linkCopied, setLinkCopied] = useState(false)
  const [copyLiveMessage, setCopyLiveMessage] = useState("")

  useLayoutEffect(() => {
    if (hasCompareParam) {
      const raw = compareRaw || ","
      writeCompareSession(raw)
      setSessionRaw(raw)
      return
    }
    setSessionRaw(readCompareSession())
  }, [hasCompareParam, compareRaw])

  const scrolledFor = useRef<string | null>(null)
  useEffect(() => {
    if (!hasCompareParam || compareRaw == null) return
    if (compareRaw === "," || !compareRaw.trim()) return
    if (scrolledFor.current === compareRaw) return
    scrolledFor.current = compareRaw
    requestAnimationFrame(() => {
      document.getElementById("compare")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }, [hasCompareParam, compareRaw])

  const [leftId, rightId] = resolveComparePair(
    hasCompareParam,
    compareRaw,
    sessionRaw === undefined ? null : sessionRaw,
    defaults,
    knownIds,
  )

  const writeCompare = (nextLeft: string, nextRight: string) => {
    const next = serializeCompareParam(nextLeft, nextRight)
    writeCompareSession(next)
    setSessionRaw(next)

    const params = new URLSearchParams(searchParams.toString())
    if (!nextLeft && !nextRight) {
      // Clear drops the query so sessionStorage is the fallback on return.
      params.delete("compare")
    } else {
      params.set("compare", next)
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  if (products.length < 2) return null

  const left = products.find((p) => p.formId === leftId)
  const right = products.find((p) => p.formId === rightId)
  const ready = Boolean(left && right && left.formId !== right.formId)

  const onPickLeft = (formId: string) => {
    let nextRight = rightId
    if (formId && formId === nextRight) {
      const other = products.find((p) => p.formId !== formId)
      if (other) nextRight = other.formId
    }
    writeCompare(formId, nextRight)
  }

  const onPickRight = (formId: string) => {
    let nextLeft = leftId
    if (formId && formId === nextLeft) {
      const other = products.find((p) => p.formId !== formId)
      if (other) nextLeft = other.formId
    }
    writeCompare(nextLeft, formId)
  }

  const swap = () => writeCompare(rightId, leftId)
  const clear = () => writeCompare("", "")

  const sharePath =
    ready && leftId && rightId
      ? `${pathname}?compare=${serializeCompareParam(leftId, rightId)}`
      : null
  const canShare = Boolean(sharePath)
  const copyHintId = `${baseId}-copy-hint`

  const copyCompareLink = async () => {
    if (!sharePath) return
    // Ensure the address bar matches what we put on the clipboard.
    if (!hasCompareParam || compareRaw !== serializeCompareParam(leftId, rightId)) {
      writeCompare(leftId, rightId)
    }
    const url = `${window.location.origin}${sharePath}`
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      setCopyLiveMessage(copy.copiedLink)
      toast.success(copy.copiedLink)
      window.setTimeout(() => {
        setLinkCopied(false)
        setCopyLiveMessage("")
      }, 1800)
    } catch {
      toast.error(copy.copyLink)
    }
  }

  return (
    <section
      id="compare"
      aria-labelledby={`${baseId}-heading`}
      className="mt-16 scroll-mt-28 border-t border-border pt-12 sm:mt-20 sm:pt-14"
    >
      <div className="mb-8 max-w-2xl">
        <h2
          id={`${baseId}-heading`}
          className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {copy.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{copy.body}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">{copy.pickA}</span>
            <select
              value={leftId}
              onChange={(e) => onPickLeft(e.target.value)}
              className="h-11 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{copy.selectPlaceholder}</option>
              {products.map((product) => (
                <option key={`l-${product.formId}`} value={product.formId}>
                  {product.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">{copy.pickB}</span>
            <select
              value={rightId}
              onChange={(e) => onPickRight(e.target.value)}
              className="h-11 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{copy.selectPlaceholder}</option>
              {products.map((product) => (
                <option key={`r-${product.formId}`} value={product.formId}>
                  {product.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={swap}
              disabled={!leftId || !rightId}
              className="inline-flex h-11 items-center gap-2 border border-input bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden />
              {copy.swap}
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={!leftId && !rightId}
              className="inline-flex h-11 items-center border border-input bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              {copy.clear}
            </button>
            <button
              type="button"
              onClick={copyCompareLink}
              aria-disabled={canShare ? undefined : true}
              aria-describedby={canShare ? undefined : copyHintId}
              className={cn(
                "inline-flex h-11 items-center gap-2 border border-input bg-background px-3 text-sm font-medium transition",
                canShare
                  ? "hover:bg-muted"
                  : "cursor-not-allowed opacity-40",
              )}
            >
              {linkCopied ? (
                <Check className="h-4 w-4 text-primary" aria-hidden />
              ) : (
                <Link2 className="h-4 w-4" aria-hidden />
              )}
              {linkCopied ? copy.copiedLink : copy.copyLink}
            </button>
          </div>
          {!canShare ? (
            <p
              id={copyHintId}
              className="max-w-xs text-xs leading-snug text-muted-foreground sm:text-end"
            >
              {copy.copyHint}
            </p>
          ) : null}
          <div role="status" aria-live="polite" className="sr-only">
            {copyLiveMessage}
          </div>
        </div>
      </div>

      {!ready ? (
        <p className="mt-8 border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          {copy.empty}
        </p>
      ) : (
        <div className="mt-8 grid gap-0 border border-border lg:grid-cols-[1fr_auto_1fr]">
          <CompareColumn product={left!} lang={lang} applyLabel={copy.apply} />
          <div
            className="flex items-center justify-center border-y border-border bg-muted/40 px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground lg:border-x lg:border-y-0 lg:px-4"
            aria-hidden
          >
            {copy.vs}
          </div>
          <CompareColumn product={right!} lang={lang} applyLabel={copy.apply} />
        </div>
      )}
    </section>
  )
}

function CompareColumn({
  product,
  lang,
  applyLabel,
}: {
  product: CompareProduct
  lang: string
  applyLabel: string
}) {
  return (
    <article className="flex flex-col bg-card/40">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 40vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 start-3 end-3">
          <h3 className="font-[family-name:var(--font-display)] text-xl font-bold">
            {product.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{product.blurb}</p>
        </div>
      </div>
      <ul className="flex flex-1 flex-col gap-2.5 px-5 py-5">
        {product.highlights.map((line) => (
          <li
            key={line}
            className="flex items-start gap-2.5 text-sm leading-snug text-foreground"
          >
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              aria-hidden
            />
            {line}
          </li>
        ))}
      </ul>
      <div className="border-t border-border px-5 py-4">
        <Link
          href={`/${lang}/insurance/${product.formId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {applyLabel.replace("{product}", product.title)}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  )
}
