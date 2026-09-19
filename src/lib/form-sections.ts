import type { InsuranceField } from "@/types/insurance"

export type FormSection = {
  id: string
  label: string
  fields: InsuranceField[]
}

/** One wizard section per top-level field (groups stay together). */
export function buildFormSections(fields: InsuranceField[]): FormSection[] {
  return fields.map((field) => ({
    id: field.id,
    label: field.label,
    fields: [field],
  }))
}

export function getFieldPaths(field: InsuranceField, parentPath = ""): string[] {
  const path = parentPath ? `${parentPath}.${field.id}` : field.id
  if (field.type === "group" && field.fields?.length) {
    return field.fields.flatMap((sub) => getFieldPaths(sub, path))
  }
  return [path]
}

export function getSectionPaths(section: FormSection): string[] {
  return section.fields.flatMap((field) => getFieldPaths(field))
}
