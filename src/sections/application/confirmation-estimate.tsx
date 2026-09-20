"use client"

import { useEffect, useState } from "react"
import { getLocalApplicationById } from "@/lib/local-applications"
import { formatMonthlyEstimate } from "@/lib/format-money"

type Props = {
  applicationId: string
  label: string
  lang: string
  perMonthSuffix: string
  tomanSuffix: string
}

export function ConfirmationEstimate({
  applicationId,
  label,
  lang,
  perMonthSuffix,
  tomanSuffix,
}: Props) {
  const [estimate, setEstimate] = useState<string | null>(null)

  useEffect(() => {
    const app = getLocalApplicationById(applicationId)
    if (typeof app?.monthlyEstimate !== "number") {
      setEstimate(null)
      return
    }
    setEstimate(
      formatMonthlyEstimate(app.monthlyEstimate, lang, {
        perMonth: perMonthSuffix,
        toman: tomanSuffix,
      }),
    )
  }, [applicationId, lang, perMonthSuffix, tomanSuffix])

  if (!estimate) return null

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold">{estimate}</p>
    </div>
  )
}
