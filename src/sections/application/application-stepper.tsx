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
                aria-current={active ? "step" : undefined}
                animate={active ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={{ duration: 0.45 }}
              >
                {done ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
              </motion.span>
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
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
