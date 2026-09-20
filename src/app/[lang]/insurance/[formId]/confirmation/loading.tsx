export default function Loading() {
  return (
    <div
      className="relative mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14"
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.16),_transparent_70%)]"
        aria-hidden
      />
      <div className="animate-pulse space-y-6">
        <div className="h-14 border border-border/60 bg-card/40" />
        <div className="space-y-4 border border-border bg-card/30 px-6 py-12 text-center sm:px-10">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/20" />
          <div className="mx-auto h-3 w-24 rounded bg-primary/20" />
          <div className="mx-auto h-9 w-2/3 max-w-sm rounded bg-muted" />
          <div className="mx-auto h-4 w-1/2 max-w-xs rounded bg-muted/70" />
          <div className="mx-auto mt-6 h-40 w-full max-w-md border border-border/60 bg-background/60" />
        </div>
      </div>
    </div>
  )
}
