"use client"

import { Download } from "lucide-react"
import { toast } from "sonner"
import { getLocalApplications } from "@/lib/local-applications"
import { Button } from "@/components/ui/button"

type Props = {
  label: string
  emptyLabel: string
  doneLabel: string
}

export function ExportApplicationsButton({ label, emptyLabel, doneLabel }: Props) {
  const onExport = () => {
    const apps = getLocalApplications()
    if (apps.length === 0) {
      toast.message(emptyLabel)
      return
    }
    const blob = new Blob([JSON.stringify(apps, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `sip-applications-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success(doneLabel)
  }

  return (
    <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onExport}>
      <Download className="h-4 w-4" aria-hidden />
      {label}
    </Button>
  )
}
