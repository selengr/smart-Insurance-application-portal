"use client"

import { Check } from "lucide-react"

type Step = {
  id: string
  label: string
}

export function ApplicationStepper({
  steps,
  currentIndex,
}: {
  steps: Step[]
  currentIndex: number
}) {
  return (
    <ol className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
      {steps.map((step, index) => {
        const done = index < currentIndex
        const active = index === currentIndex
        return (
          <li key={step.id} className="flex flex-1 items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <span
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary bg-background text-primary ring-2 ring-primary/25"
                      : "border-border bg-muted/40 text-muted-foreground",
                ].join(" ")}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
              </span>
              <span
                className={[
                  "text-sm font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={[
                  "mx-3 hidden h-px flex-1 sm:block",
                  done ? "bg-primary/60" : "bg-border",
                ].join(" ")}
                aria-hidden
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
