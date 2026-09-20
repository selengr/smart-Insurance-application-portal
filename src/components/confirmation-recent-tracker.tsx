"use client"

import { useEffect } from "react"
import { trackRecentApplication } from "@/lib/local-applications"

export function ConfirmationRecentTracker({ reference }: { reference: string }) {
  useEffect(() => {
    if (reference) trackRecentApplication(reference)
  }, [reference])

  return null
}
