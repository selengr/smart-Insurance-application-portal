export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6" role="status" aria-live="polite">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-48 rounded bg-muted" />
          <div className="h-48 rounded bg-muted" />
          <div className="h-48 rounded bg-muted" />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}
