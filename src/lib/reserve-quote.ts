import type { FormValues } from "@/types/insurance"

const BASE: Record<string, number> = {
  health_insurance_application: 89,
  home_insurance_application: 64,
  car_insurance_application: 112,
  life_insurance_application: 48,
}

function flatten(values: FormValues, out: string[] = []): string[] {
  Object.values(values).forEach((value) => {
    if (value === undefined || value === null || value === "" || value === "_lastSaved") return
    if (value instanceof Date) return
    if (typeof value === "object" && !Array.isArray(value)) {
      flatten(value as FormValues, out)
      return
    }
    out.push(String(value))
  })
  return out
}

/** Demo-only monthly estimate so the reserve step feels like a real checkout. */
export function estimateMonthlyPremium(formId: string, values: FormValues): number {
  const base = BASE[formId] ?? 75
  const tokens = flatten(values).join(" ").toLowerCase()

  let bump = 0
  if (tokens.includes("premium") || tokens.includes("ویژه") || tokens.includes("full cover") || tokens.includes("کامل")) {
    bump += 35
  }
  if (tokens.includes("comprehensive") || tokens.includes("بدنه") || tokens.includes("high value")) {
    bump += 22
  }
  if (tokens.includes("smoker") || tokens.includes("سیگار") || tokens.includes("yes") || tokens.includes("بله")) {
    bump += 18
  }
  if (tokens.includes("business") || tokens.includes("تجاری") || tokens.includes("ride-share")) {
    bump += 15
  }
  if (tokens.includes("500,000") || tokens.includes("۵۰۰")) {
    bump += 40
  } else if (tokens.includes("250,000") || tokens.includes("۲۵۰")) {
    bump += 25
  }

  // FA demo uses toman-scale numbers
  return Math.round(base + bump)
}
