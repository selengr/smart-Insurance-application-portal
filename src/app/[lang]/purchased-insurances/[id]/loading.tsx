export default function Loading() {
  return (
    <div
      className="relative mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14"
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.14),_transparent_70%)]"
        aria-hidden
      />
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-32 rounded bg-muted/80" />
        <div className="h-48 border border-border/60 bg-card/40" />
        <div className="h-8 w-2/5 max-w-xs rounded bg-muted" />
        <div className="h-4 w-1/2 max-w-md rounded bg-muted/70" />
        <div className="space-y-3 border border-border/60 bg-card/30 p-5">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted/80" />
          <div className="h-4 w-4/5 rounded bg-muted/80" />
          <div className="h-4 w-2/3 rounded bg-muted/80" />
        </div>
        <div className="h-28 border border-border/60 bg-card/30" />
      </div>
    </div>
  )
}
