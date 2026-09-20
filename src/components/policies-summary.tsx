"use client"

type Counts = {
  pending: number
  inReview: number
  approved: number
  rejected: number
  total: number
}

export type StatusFilterKey = "all" | "Pending" | "In Review" | "Approved" | "Rejected"

type Props = {
  counts: Counts
  active: StatusFilterKey
  onSelect: (key: StatusFilterKey) => void
  labels: {
    all: string
    pending: string
    inReview: string
    approved: string
    rejected: string
  }
}

export function PoliciesSummary({ counts, active, onSelect, labels }: Props) {
  if (counts.total === 0) return null

  const items: { key: StatusFilterKey; value: number; label: string }[] = [
    { key: "all", value: counts.total, label: labels.all },
    { key: "Pending", value: counts.pending, label: labels.pending },
    { key: "In Review", value: counts.inReview, label: labels.inReview },
    { key: "Approved", value: counts.approved, label: labels.approved },
    { key: "Rejected", value: counts.rejected, label: labels.rejected },
  ].filter((item): item is { key: StatusFilterKey; value: number; label: string } =>
    item.key === "all" || item.value > 0,
  )

  return (
    <div
      className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      role="group"
      aria-label={labels.all}
    >
      {items.map((item) => {
        const isActive = active === item.key
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            aria-pressed={isActive}
            className={[
              "border px-4 py-3 text-start transition",
              isActive
                ? "border-primary/50 bg-primary/10"
                : "border-border bg-card/60 hover:border-primary/35",
            ].join(" ")}
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">
              {item.value}
            </p>
          </button>
        )
      })}
    </div>
  )
}
