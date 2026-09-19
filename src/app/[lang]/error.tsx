"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "en"

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
        Something went wrong
      </h1>
      <p className="text-muted-foreground">
        Please try again. If the problem continues, come back later.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset}>
          Retry
        </Button>
        <Button asChild variant="outline">
          <Link href={`/${lang}`}>Go home</Link>
        </Button>
      </div>
    </main>
  )
}
