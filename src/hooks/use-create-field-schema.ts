import { z } from "zod";
import { InsuranceForm } from "@/types/insurance";

export const useGenerateZodSchema = (fields: InsuranceForm["fields"]): z.ZodTypeAny => {
    const schemaMap: Record<string, z.ZodTypeAny> = {};
  
    const processFields = (fieldList: InsuranceForm["fields"], parentId = "") => {
      fieldList.forEach((field) => {
        const fieldId = parentId ? `${parentId}.${field.id}` : field.id;
  
        if (field.type === "group" && field.fields) {
          const nestedSchema: Record<string, z.ZodTypeAny> = {};
  
          field.fields.forEach((subField) => {
            const subFieldSchema = createFieldSchema(subField);
            if (subFieldSchema) {
              nestedSchema[subField.id] = subFieldSchema;
            }
          });
  
          schemaMap[field.id] = z.object(nestedSchema);
        } else {
          const fieldSchema = createFieldSchema(field);
          if (fieldSchema) {
            schemaMap[field.id] = fieldSchema;
          }
        }
      });
    };
  
    const createFieldSchema = (field: InsuranceForm["fields"][number]): z.ZodTypeAny | null => {
      let schema: z.ZodTypeAny;
  
      switch (field.type) {
        case "text":
          schema = z.string();
          if (field.validation?.pattern) {
            schema = schema.regex(new RegExp(field.validation.pattern));
          }
          break;
  
        case "number":
          schema = z.number();
          if (field.validation?.min !== undefined) {
            schema = schema.min(field.validation.min);
          }
          if (field.validation?.max !== undefined) {
            schema = schema.max(field.validation.max);
          }
          break;
  
        case "date":
          case "select":
          case "radio":
          case "checkbox":
            schema = z.string();
            break;
  
        case "group":
          default:
            return null;
      }
  
      if (!field.required) {
        schema = schema.optional();
      }
  
      return schema;
    };
  
    processFields(fields);
    return z.object(schemaMap);
  };
  