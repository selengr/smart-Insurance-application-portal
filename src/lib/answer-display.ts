import {
  buildFormFieldLabelIndex,
  labelForFieldKey,
  localizeStoredAnswerValue,
  type FieldLabelEntry,
  type FormsCatalog,
} from "@/lib/form-i18n"

export type AnswerRow = {
  label: string
  value: string
}

type FlattenLabels = {
  yes: string
  no: string
  valueLabel: string
}

function formatLeafValue(
  value: unknown,
  fieldKey: string,
  labels: FlattenLabels,
  index: Record<string, FieldLabelEntry>,
  lang: string,
): string {
  if (typeof value === "boolean") {
    return value ? labels.yes : labels.no
  }
  if (value instanceof Date) {
    return value.toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US")
  }
  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((item) =>
        typeof item === "string"
          ? localizeStoredAnswerValue(item, fieldKey, index, lang)
          : String(item),
      )
      .join(", ")
  }
  if (typeof value === "string") {
    return localizeStoredAnswerValue(value, fieldKey, index, lang)
  }
  return String(value)
}

export function flattenLocalizedAnswers(
  value: unknown,
  options: {
    labels: FlattenLabels
    fieldIndex: Record<string, FieldLabelEntry>
    lang: string
    fieldKey?: string
    prefix?: string
  },
): AnswerRow[] {
  const { labels, fieldIndex, lang, fieldKey = "", prefix = "" } = options

  if (value === undefined || value === null || value === "") return []

  if (
    typeof value === "boolean" ||
    value instanceof Date ||
    Array.isArray(value) ||
    typeof value !== "object"
  ) {
    return [
      {
        label: prefix || labels.valueLabel,
        value: formatLeafValue(value, fieldKey, labels, fieldIndex, lang),
      },
    ]
  }

  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, nested]) => {
      const segment = labelForFieldKey(key, fieldIndex)
      const nextPrefix = prefix ? `${prefix} · ${segment}` : segment
      return flattenLocalizedAnswers(nested, {
        labels,
        fieldIndex,
        lang,
        fieldKey: key,
        prefix: nextPrefix,
      })
    },
  )
}

export function answersForApplication(
  answers: unknown,
  formId: string | undefined,
  catalog: FormsCatalog | undefined,
  labels: FlattenLabels,
  lang: string,
): AnswerRow[] {
  const fieldIndex = buildFormFieldLabelIndex(catalog, formId ?? "")
  return flattenLocalizedAnswers(answers, {
    labels,
    fieldIndex,
    lang,
  })
}
