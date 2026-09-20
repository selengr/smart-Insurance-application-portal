"use client"

type Counts = {
  pending: number
  inReview: number
  approved: number
  rejected: number
  total: number
}

type Props = {
  counts: Counts
  labels: {
    pending: string
    inReview: string
    approved: string
    rejected: string
    total: string
  }
}

export function PoliciesSummary({ counts, labels }: Props) {
  if (counts.total === 0) return null

  const items = [
    { key: "pending", value: counts.pending, label: labels.pending },
    { key: "inReview", value: counts.inReview, label: labels.inReview },
    { key: "approved", value: counts.approved, label: labels.approved },
    { key: "rejected", value: counts.rejected, label: labels.rejected },
  ].filter((item) => item.value > 0)

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.key}
          className="border border-border bg-card/60 px-4 py-3"
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
