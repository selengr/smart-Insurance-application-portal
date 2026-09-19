"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import en from "@/dictionaries/en.json"
import fa from "@/dictionaries/fa.json"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "en"
  const common = (lang === "fa" ? fa : en).page.common

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
        {common.errorTitle}
      </h1>
      <p className="text-muted-foreground">{common.errorBody}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset}>
          {common.retry}
        </Button>
        <Button asChild variant="outline">
          <Link href={`/${lang}`}>{common.goHome}</Link>
        </Button>
      </div>
    </main>
  )
}
