import { Shield, Sparkles, Clock3 } from "lucide-react"

const ICONS = [Sparkles, Shield, Clock3]

export type ApplicationTip = {
  title: string
  body: string
}

export function ApplicationTips({
  tips,
  heading,
}: {
  tips: ApplicationTip[]
  heading: string
}) {
  if (!tips.length) return null

  return (
    <aside className="border border-border/80 bg-card/40 p-5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary">
        {heading}
      </p>
      <ul className="mt-4 space-y-4">
        {tips.map((tip, index) => {
          const Icon = ICONS[index % ICONS.length]
          return (
            <li key={tip.title} className="flex gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-background">
                <Icon className="h-4 w-4 text-primary" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">{tip.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {tip.body}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
