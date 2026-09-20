/**
 * Demo quote estimator checks — mirrors src/lib/reserve-quote.ts
 * Run: npm test
 */
import assert from "node:assert/strict"
import test from "node:test"

const BASE = {
  health_insurance_application: 89,
  home_insurance_application: 64,
  car_insurance_application: 112,
  life_insurance_application: 48,
}

function flatten(values, out = []) {
  Object.entries(values).forEach(([key, value]) => {
    if (key === "_lastSaved") return
    if (value === undefined || value === null || value === "") return
    if (typeof value === "object" && !Array.isArray(value)) {
      flatten(value, out)
      return
    }
    out.push(String(value))
  })
  return out
}

function estimateMonthlyPremium(formId, values) {
  const base = BASE[formId] ?? 75
  const tokens = flatten(values).join(" ").toLowerCase()
  let bump = 0
  if (tokens.includes("premium") || tokens.includes("full cover")) bump += 35
  if (tokens.includes("comprehensive")) bump += 22
  if (tokens.includes("smoker") || tokens.includes("yes")) bump += 18
  return Math.round(base + bump)
}

test("base health quote without extras", () => {
  assert.equal(
    estimateMonthlyPremium("health_insurance_application", { coverage: "Standard" }),
    89,
  )
})

test("premium + smoker bumps the estimate", () => {
  const quote = estimateMonthlyPremium("health_insurance_application", {
    coverage: "Premium",
    smoker: "yes",
  })
  assert.equal(quote, 89 + 35 + 18)
})

test("unknown form id falls back to default base", () => {
  assert.equal(estimateMonthlyPremium("unknown_form", {}), 75)
})
