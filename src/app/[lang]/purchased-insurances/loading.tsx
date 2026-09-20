export default function Loading() {
  return (
    <div
      className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14"
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.14),_transparent_70%)]"
        aria-hidden
      />
      <div className="animate-pulse space-y-6">
        <div className="h-3 w-28 rounded bg-primary/20" />
        <div className="h-10 w-2/5 max-w-sm rounded bg-muted" />
        <div className="h-4 w-1/2 max-w-md rounded bg-muted/80" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="h-20 border border-border/60 bg-card/50" />
          <div className="h-20 border border-border/60 bg-card/50" />
          <div className="h-20 border border-border/60 bg-card/50" />
          <div className="h-20 border border-border/60 bg-card/50" />
        </div>
        <div className="h-64 border border-border/60 bg-card/40" />
      </div>
    </div>
  )
}
