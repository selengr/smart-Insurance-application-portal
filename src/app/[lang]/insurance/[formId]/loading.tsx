export default function Loading() {
  return (
    <div
      className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12"
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.18),_transparent_70%)]"
        aria-hidden
      />
      <div className="animate-pulse space-y-6">
        <div className="mx-auto h-10 w-full max-w-md rounded bg-muted/80" />
        <div className="h-3 w-24 rounded bg-primary/20" />
        <div className="h-9 w-2/5 max-w-xs rounded bg-muted" />
        <div className="h-4 w-3/5 max-w-md rounded bg-muted/70" />
        <div className="space-y-4 border border-border/60 bg-card/40 p-5 sm:p-6">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted/80" />
          <div className="h-4 w-1/4 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted/80" />
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted/80" />
        </div>
        <div className="flex justify-end gap-3">
          <div className="h-10 w-28 rounded bg-muted" />
          <div className="h-10 w-36 rounded bg-primary/25" />
        </div>
      </div>
    </div>
  )
}
