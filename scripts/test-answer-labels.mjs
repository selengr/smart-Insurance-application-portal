import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const fa = JSON.parse(readFileSync(join(root, "src/dictionaries/fa.json"), "utf8"))

function buildFormFieldLabelIndex(catalog, formId) {
  const index = {}
  const walk = (fields) => {
    if (!fields) return
    for (const [id, override] of Object.entries(fields)) {
      if (override.label || override.options) {
        index[id] = {
          label: override.label ?? id,
          options: override.options,
        }
      }
      if (override.fields) walk(override.fields)
    }
  }
  walk(catalog?.[formId]?.fields)
  return index
}

function labelForFieldKey(key, index) {
  return index[key]?.label ?? key.replaceAll("_", " ")
}

function localizeStoredAnswerValue(value, fieldKey, index) {
  return index[fieldKey]?.options?.[value] ?? value
}

function flattenLocalizedAnswers(value, { labels, fieldIndex, fieldKey = "", prefix = "" }) {
  if (value === undefined || value === null || value === "") return []
  if (
    typeof value === "boolean" ||
    value instanceof Date ||
    Array.isArray(value) ||
    typeof value !== "object"
  ) {
    let display = String(value)
    if (typeof value === "boolean") display = value ? labels.yes : labels.no
    else if (typeof value === "string") {
      display = localizeStoredAnswerValue(value, fieldKey, fieldIndex)
    }
    return [{ label: prefix || labels.valueLabel, value: display }]
  }
  return Object.entries(value).flatMap(([key, nested]) => {
    const segment = labelForFieldKey(key, fieldIndex)
    const nextPrefix = prefix ? `${prefix} · ${segment}` : segment
    return flattenLocalizedAnswers(nested, {
      labels,
      fieldIndex,
      fieldKey: key,
      prefix: nextPrefix,
    })
  })
}

test("FA catalog maps nested field ids to Persian labels", () => {
  const index = buildFormFieldLabelIndex(fa.page.forms, "health_insurance_application")
  assert.equal(index.first_name.label, "نام")
  assert.equal(index.coverage.label, "نوع پوشش")
  assert.equal(index.gender.options.Female, "زن")
})

test("flatten answers uses catalog labels and option maps", () => {
  const index = buildFormFieldLabelIndex(fa.page.forms, "health_insurance_application")
  const rows = flattenLocalizedAnswers(
    {
      personal_info: { first_name: "Ada", gender: "Female" },
      coverage: "Premium",
      smoker: true,
    },
    {
      labels: { yes: "بله", no: "خیر", valueLabel: "مقدار" },
      fieldIndex: index,
    },
  )

  const nameRow = rows.find((r) => r.label.includes("نام") && !r.label.includes("جنسیت"))
  assert.ok(nameRow)
  assert.equal(nameRow.value, "Ada")

  const genderRow = rows.find((r) => r.label.includes("جنسیت"))
  assert.ok(genderRow)
  assert.equal(genderRow.value, "زن")

  const coverageRow = rows.find((r) => r.label === "نوع پوشش" || r.label.includes("نوع پوشش"))
  assert.ok(coverageRow)
  assert.equal(coverageRow.value, "ویژه")

  const smokerRow = rows.find((r) => r.value === "بله")
  assert.ok(smokerRow)
  assert.match(smokerRow.label, /سیگار|دود/)
})
