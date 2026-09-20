"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"

type Props = {
  value: string
  copyLabel: string
  copiedLabel: string
}

export function CopyReferenceButton({ value, copyLabel, copiedLabel }: Props) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(copiedLabel)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error(copyLabel)
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
      aria-label={copyLabel}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {copied ? copiedLabel : copyLabel}
    </button>
  )
}
