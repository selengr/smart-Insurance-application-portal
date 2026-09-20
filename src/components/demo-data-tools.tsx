"use client"

import { useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Download, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import {
  clearDemoBrowserData,
  getLocalApplications,
  importLocalApplications,
} from "@/lib/local-applications"
import { Button } from "@/components/ui/button"

type Props = {
  exportLabel: string
  exportEmpty: string
  exportDone: string
  importLabel: string
  importDone: string
  importFailed: string
  clearLabel: string
  clearConfirm: string
  clearDone: string
  clearCancel: string
}

export function DemoDataTools({
  exportLabel,
  exportEmpty,
  exportDone,
  importLabel,
  importDone,
  importFailed,
  clearLabel,
  clearConfirm,
  clearDone,
  clearCancel,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const [confirmClear, setConfirmClear] = useState(false)

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["purchased-insurances"] })
  }

  const onExport = () => {
    const apps = getLocalApplications()
    if (apps.length === 0) {
      toast.message(exportEmpty)
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
    toast.success(exportDone)
  }

  const onImportFile = async (file: File | null) => {
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as unknown
      const result = importLocalApplications(parsed, "merge")
      refresh()
      toast.success(
        importDone
          .replace("{count}", String(result.imported))
          .replace("{skipped}", String(result.skipped)),
      )
    } catch {
      toast.error(importFailed)
    } finally {
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const onClear = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    clearDemoBrowserData()
    setConfirmClear(false)
    refresh()
    toast.success(clearDone)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onExport}>
        <Download className="h-4 w-4" aria-hidden />
        {exportLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" aria-hidden />
        {importLabel}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(event) => void onImportFile(event.target.files?.[0] ?? null)}
      />
      {confirmClear ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{clearConfirm}</span>
          <Button type="button" size="sm" variant="destructive" onClick={onClear}>
            {clearLabel}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setConfirmClear(false)}>
            {clearCancel}
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onClear}>
          <Trash2 className="h-4 w-4" aria-hidden />
          {clearLabel}
        </Button>
      )}
    </div>
  )
}
