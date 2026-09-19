import { z } from "zod"
import { InsuranceForm } from "@/types/insurance"

export type ValidationMessages = {
  required: string
  invalidNumber: string
  tooSmall: string
  tooBig: string
}

const defaults: ValidationMessages = {
  required: "This field is required",
  invalidNumber: "Enter a valid number",
  tooSmall: "Value is too small",
  tooBig: "Value is too large",
}

export const generateZodSchema = (
  fields: InsuranceForm["fields"],
  messages: ValidationMessages = defaults,
): z.ZodTypeAny => {
  const schemaMap: Record<string, z.ZodTypeAny> = {}

  const createFieldSchema = (field: InsuranceForm["fields"][number]): z.ZodTypeAny | null => {
    let schema: z.ZodTypeAny

    switch (field.type) {
      case "text":
        schema = z.string()
        if (field.required) {
          schema = (schema as z.ZodString).min(1, messages.required)
        }
        if (field.validation?.pattern) {
          schema = (schema as z.ZodString).regex(new RegExp(field.validation.pattern))
        }
        break

      case "number":
        schema = z.coerce.number({
          invalid_type_error: messages.invalidNumber,
        })
        if (field.validation?.min !== undefined) {
          schema = (schema as z.ZodNumber).min(field.validation.min, messages.tooSmall)
        }
        if (field.validation?.max !== undefined) {
          schema = (schema as z.ZodNumber).max(field.validation.max, messages.tooBig)
        }
        break

      case "date":
        schema = z.date({
          required_error: messages.required,
          invalid_type_error: messages.required,
        })
        break

      case "select":
      case "radio":
        schema = field.required
          ? z.string().min(1, messages.required)
          : z.string()
        break

      case "checkbox":
        schema =
          field.options && field.options.length > 0
            ? z.array(z.string())
            : z.boolean()
        if (field.required && field.options && field.options.length > 0) {
          schema = (schema as z.ZodArray<z.ZodString>).min(1, messages.required)
        }
        break

      case "group":
      default:
        return null
    }

    if (!field.required) {
      schema = schema.optional()
    }

    return schema
  }

  const processFields = (fieldList: InsuranceForm["fields"]) => {
    fieldList.forEach((field) => {
      if (field.type === "group" && field.fields) {
        const nestedSchema: Record<string, z.ZodTypeAny> = {}
        field.fields.forEach((subField) => {
          const subFieldSchema = createFieldSchema(subField)
          if (subFieldSchema) {
            nestedSchema[subField.id] = subFieldSchema
          }
        })
        schemaMap[field.id] = z.object(nestedSchema)
      } else {
        const fieldSchema = createFieldSchema(field)
        if (fieldSchema) {
          schemaMap[field.id] = fieldSchema
        }
      }
    })
  }

  processFields(fields)
  return z.object(schemaMap)
}
