import type { FormValues, InsuranceField } from "@/types/insurance"

export type ReviewRow = {
  label: string
  value: string
  path: string
}

type ReviewOptions = {
  yes?: string
  no?: string
  locale?: string
}

function formatValue(value: unknown, options?: ReviewOptions): string | null {
  if (value === undefined || value === null || value === "") return null
  if (value instanceof Date) {
    return value.toLocaleDateString(options?.locale ?? undefined)
  }
  if (typeof value === "boolean") {
    return value ? (options?.yes ?? "") : (options?.no ?? "")
  }
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || null
  if (typeof value === "object") return null
  return String(value)
}

export function buildReviewRows(
  fields: InsuranceField[],
  values: FormValues,
  options?: ReviewOptions,
  parentPath = "",
): ReviewRow[] {
  const rows: ReviewRow[] = []

  for (const field of fields) {
    const path = parentPath ? `${parentPath}.${field.id}` : field.id

    if (field.type === "group" && field.fields) {
      const nested = values[field.id]
      if (nested && typeof nested === "object" && !Array.isArray(nested)) {
        rows.push(
          ...buildReviewRows(field.fields, nested as FormValues, options, path),
        )
      }
      continue
    }

    const raw = parentPath
      ? (values as Record<string, unknown>)[field.id]
      : getByPath(values, path)
    const formatted = formatValue(raw, options)
    if (formatted) {
      rows.push({ label: field.label, value: formatted, path })
    }
  }

  return rows
}

function getByPath(values: FormValues, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && !Array.isArray(acc)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, values)
}
