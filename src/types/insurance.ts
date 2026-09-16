export type InsuranceFieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "group";

export interface InsuranceForm {
  formId: string;
  title: string;
  fields: InsuranceField[];
}

export interface InsuranceField {
  id: string;
  label: string;
  type: InsuranceFieldType;
  required?: boolean;
  options?: string[];
  fields?: InsuranceField[];
  visibility?: {
    dependsOn: string;
    condition: string;
    value: string;
  };
  dynamicOptions?: {
    dependsOn: string;
    endpoint: string;
    method: string;
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export type FormValues = Record<string, unknown>;
