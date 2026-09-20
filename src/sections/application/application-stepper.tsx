"use client"

import { Check } from "lucide-react"
import { motion } from "motion/react"

type Step = {
  id: string
  label: string
}

export function ApplicationStepper({
  steps,
  currentIndex,
  onStepSelect,
  ariaLabel,
}: {
  steps: Step[]
  currentIndex: number
  onStepSelect?: (index: number) => void
  ariaLabel: string
}) {
  return (
    <nav aria-label={ariaLabel}>
      <ol className="flex w-full flex-col gap-0 sm:flex-row sm:items-center">
        {steps.map((step, index) => {
          const done = index < currentIndex
          const active = index === currentIndex
          const selectable = Boolean(onStepSelect) && index < currentIndex && index < 2

          const badge = (
            <motion.span
              layout
              className={[
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : active
                    ? "border-primary bg-background text-primary ring-2 ring-primary/25"
                    : "border-border bg-muted/40 text-muted-foreground",
              ].join(" ")}
              aria-hidden
            >
              {done ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
            </motion.span>
          )

          const label = (
            <span
              className={[
                "text-sm font-medium",
                active ? "text-foreground" : "text-muted-foreground",
                selectable ? "underline-offset-4 group-hover:underline" : "",
              ].join(" ")}
            >
              {step.label}
            </span>
          )

          return (
            <li
              key={step.id}
              className="flex flex-1 flex-col sm:flex-row sm:items-center"
              aria-current={active ? "step" : undefined}
            >
              <div className="flex items-center gap-3">
                {selectable ? (
                  <button
                    type="button"
                    className="group flex items-center gap-3 rounded-md text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => onStepSelect?.(index)}
                    aria-label={`${step.label} (${index + 1})`}
                  >
                    {badge}
                    {label}
                  </button>
                ) : (
                  <div className="flex items-center gap-3" aria-label={`${step.label} (${index + 1})`}>
                    {badge}
                    {label}
                  </div>
                )}
              </div>

              {index < steps.length - 1 ? (
                <>
                  <div
                    className="ms-4 my-1 h-5 w-px overflow-hidden bg-border sm:hidden"
                    aria-hidden
                  >
                    <motion.div
                      className="w-full bg-primary/70"
                      initial={false}
                      animate={{ height: done ? "100%" : "0%" }}
                      transition={{ duration: 0.35 }}
                    />
                  </div>
                  <div
                    className="mx-3 hidden h-px flex-1 overflow-hidden bg-border sm:block"
                    aria-hidden
                  >
                    <motion.div
                      className="h-full bg-primary/70"
                      initial={false}
                      animate={{ width: done ? "100%" : "0%" }}
                      transition={{ duration: 0.35 }}
                    />
                  </div>
                </>
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
