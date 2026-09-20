"use client"

import type { ReactNode } from "react"
import { useFocusTrap } from "@/hooks/use-focus-trap"

type Props = {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: ReactNode
  className?: string
}

export function FocusTrapDialog({
  open,
  onClose,
  labelledBy,
  children,
  className = "w-full max-w-md rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg",
}: Props) {
  const dialogRef = useFocusTrap(open, onClose)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={className}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
