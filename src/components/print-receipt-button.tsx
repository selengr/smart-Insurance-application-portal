"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PrintReceiptButton({ label }: { label: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2"
      data-print-hide
      onClick={() => window.print()}
    >
      <Printer className="h-4 w-4" aria-hidden />
      {label}
    </Button>
  )
}
