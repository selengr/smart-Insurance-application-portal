"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import en from "@/dictionaries/en.json"
import fa from "@/dictionaries/fa.json"

export default function NotFound() {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "en"
  const dict = lang === "fa" ? fa : en
  const common = dict.page.common

  return (
    <main className="relative mx-auto flex min-h-[55vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.16),_transparent_70%)]"
        aria-hidden
      />
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary">
        {dict.page.home.brand}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-4xl">
        {common.notFoundTitle}
      </h1>
      <p className="max-w-md text-muted-foreground">{common.notFoundBody}</p>
      <p className="text-xs text-muted-foreground">{common.notFoundRecover}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href={`/${lang}`}>{common.goHome}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/${lang}#products`}>{common.browseProducts}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/${lang}/purchased-insurances`}>{common.viewPolicies}</Link>
        </Button>
      </div>
    </main>
  )
}
