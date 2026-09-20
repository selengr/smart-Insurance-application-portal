export const STATUS_CHIP_STYLES: Record<string, string> = {
  Pending:
    "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-400/30",
  Approved:
    "bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-400/30",
  Rejected:
    "bg-rose-100 text-rose-900 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-950 dark:text-rose-200 dark:ring-rose-400/30",
  "In Review":
    "bg-sky-100 text-sky-900 ring-1 ring-inset ring-sky-600/20 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-400/30",
}

export const STATUS_CHIP_FALLBACK =
  "bg-muted text-muted-foreground ring-1 ring-inset ring-border"

export function statusChipClass(statusKey: string) {
  return STATUS_CHIP_STYLES[statusKey] ?? STATUS_CHIP_FALLBACK
}
