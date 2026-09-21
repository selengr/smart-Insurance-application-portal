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

function resolveComparePair(
  hasUrlParam,
  urlRaw,
  sessionRaw,
  defaults,
  knownFormIds,
) {
  if (hasUrlParam) return parseCompareParam(urlRaw, knownFormIds)
  if (sessionRaw != null) return parseCompareParam(sessionRaw, knownFormIds)
  return defaults
}

function buildCompareShareUrl(origin, pathname, leftId, rightId) {
  if (!origin || !leftId || !rightId || leftId === rightId) return null
  const pair = serializeCompareParam(leftId, rightId)
  if (!pair || pair === ",") return null
  const base = origin.replace(/\/$/, "")
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${base}${path}?compare=${pair}`
}

const IDS = [
  "health_insurance_application",
  "home_insurance_application",
  "car_insurance_application",
  "life_insurance_application",
]

const DEFAULTS = [
  "health_insurance_application",
  "home_insurance_application",
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

test("resolveComparePair prefers URL, then session, then defaults", () => {
  assert.deepEqual(
    resolveComparePair(true, "car,life", "health,home", DEFAULTS, IDS),
    ["car_insurance_application", "life_insurance_application"],
  )
  assert.deepEqual(
    resolveComparePair(false, null, "health,car", DEFAULTS, IDS),
    ["health_insurance_application", "car_insurance_application"],
  )
  assert.deepEqual(
    resolveComparePair(false, null, ",", DEFAULTS, IDS),
    ["", ""],
  )
  assert.deepEqual(
    resolveComparePair(false, null, null, DEFAULTS, IDS),
    DEFAULTS,
  )
})

test("buildCompareShareUrl joins origin, pathname, and pair", () => {
  assert.equal(
    buildCompareShareUrl(
      "https://example.com",
      "/en",
      "health_insurance_application",
      "home_insurance_application",
    ),
    "https://example.com/en?compare=health,home",
  )
  assert.equal(
    buildCompareShareUrl(
      "https://example.com/",
      "en",
      "car_insurance_application",
      "life_insurance_application",
    ),
    "https://example.com/en?compare=car,life",
  )
  assert.equal(
    buildCompareShareUrl(
      "https://example.com",
      "/en",
      "health_insurance_application",
      "health_insurance_application",
    ),
    null,
  )
  assert.equal(
    buildCompareShareUrl("https://example.com", "/en", "health_insurance_application", ""),
    null,
  )
  assert.equal(buildCompareShareUrl("", "/en", "health_insurance_application", "home_insurance_application"), null)
})
