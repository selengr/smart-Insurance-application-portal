"use client"

import { useState } from "react"
import { Check, Link2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  path: string
  copyLabel: string
  copiedLabel: string
}

export function ShareLinkButton({ path, copyLabel, copiedLabel }: Props) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${path}` : path
    try {
      await navigator.clipboard.writeText(url)
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
      {copied ? (
        <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
      ) : (
        <Link2 className="h-3.5 w-3.5" aria-hidden />
      )}
      {copied ? copiedLabel : copyLabel}
    </button>
  )
}
