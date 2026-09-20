"use client"

import { useEffect, useState } from "react"
import { getLocalApplicationById } from "@/lib/local-applications"

type Props = {
  applicationId: string
  label: string
  lang: string
}

export function ConfirmationEstimate({ applicationId, label, lang }: Props) {
  const [estimate, setEstimate] = useState<string | null>(null)

  useEffect(() => {
    const app = getLocalApplicationById(applicationId)
    if (typeof app?.monthlyEstimate !== "number") {
      setEstimate(null)
      return
    }
    setEstimate(
      lang === "fa"
        ? `${app.monthlyEstimate.toLocaleString("fa-IR")} تومان`
        : `$${app.monthlyEstimate.toLocaleString("en-US")}/mo`,
    )
  }, [applicationId, lang])

  if (!estimate) return null

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold">{estimate}</p>
    </div>
  )
}
