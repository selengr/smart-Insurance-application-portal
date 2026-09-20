import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { productVisual, productTitle } from "@/lib/product-visuals"

type Props = {
  lang: string
  formId: string
  title: string
  blurb?: string
  backLabel: string
  stepLabel?: string
}

export function ApplicationHero({
  lang,
  formId,
  title,
  blurb,
  backLabel,
  stepLabel,
}: Props) {
  const visual = productVisual(formId, title)
  const heading = productTitle(title)

  return (
    <header className="relative mb-8 overflow-hidden border border-border/70 sm:mb-10">
      <div className="absolute inset-0">
        <Image
          src={visual.src}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/55 dark:via-background/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      <div className="relative px-4 py-8 sm:px-8 sm:py-10">
        <Link
          href={`/${lang}#products`}
          className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          {backLabel}
        </Link>

        {stepLabel ? (
          <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary">
            {stepLabel}
          </p>
        ) : null}

        <h1 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-4xl">
          {heading}
        </h1>
        {blurb ? (
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            {blurb}
          </p>
        ) : null}
      </div>
    </header>
  )
}
