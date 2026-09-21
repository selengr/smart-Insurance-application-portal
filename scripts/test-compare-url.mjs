import assert from "node:assert/strict"
import test from "node:test"

function formIdToCompareSlug(formId) {
  return formId.replace(/_insurance_application$/i, "").toLowerCase()
}

function compareSlugToFormId(slug, knownFormIds) {
  const normalized = slug.trim().toLowerCase()
  if (!normalized) return ""
  if (knownFormIds.includes(slug)) return slug
  if (knownFormIds.includes(normalized)) return normalized
  const match = knownFormIds.find((id) => formIdToCompareSlug(id) === normalized)
  return match ?? ""
}

function parseCompareParam(raw, knownFormIds) {
  if (raw == null) return ["", ""]
  const parts = raw.split(",").map((part) => part.trim())
  return [
    compareSlugToFormId(parts[0] ?? "", knownFormIds),
    compareSlugToFormId(parts[1] ?? "", knownFormIds),
  ]
}

function serializeCompareParam(leftId, rightId) {
  if (!leftId && !rightId) return ","
  return [leftId, rightId]
    .map((id) => (id ? formIdToCompareSlug(id) : ""))
    .join(",")
}

const IDS = [
  "health_insurance_application",
  "home_insurance_application",
  "car_insurance_application",
  "life_insurance_application",
]

test("slug round-trip for compare pairs", () => {
  assert.equal(formIdToCompareSlug("health_insurance_application"), "health")
  assert.equal(
    compareSlugToFormId("home", IDS),
    "home_insurance_application",
  )
  assert.deepEqual(parseCompareParam("health,home", IDS), [
    "health_insurance_application",
    "home_insurance_application",
  ])
  assert.equal(
    serializeCompareParam(
      "health_insurance_application",
      "car_insurance_application",
    ),
    "health,car",
  )
  assert.equal(serializeCompareParam("", ""), ",")
  assert.deepEqual(parseCompareParam(",", IDS), ["", ""])
  assert.deepEqual(parseCompareParam("health", IDS), [
    "health_insurance_application",
    "",
  ])
  assert.equal(
    serializeCompareParam("health_insurance_application", ""),
    "health,",
  )
})
