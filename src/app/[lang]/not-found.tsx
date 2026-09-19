"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import en from "@/dictionaries/en.json"
import fa from "@/dictionaries/fa.json"

export default function NotFound() {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "en"
  const common = (lang === "fa" ? fa : en).page.common

  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
        {common.notFoundTitle}
      </h1>
      <p className="text-muted-foreground">{common.notFoundBody}</p>
      <Button asChild>
        <Link href={`/${lang}`}>{common.goHome}</Link>
      </Button>
    </main>
  )
}
