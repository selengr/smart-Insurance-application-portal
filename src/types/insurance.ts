
export interface InsuranceForm {
    formId: string;
    title: string;
    fields: InsuranceField[];
  }
  
  export interface InsuranceField {
    id: string;
    label: string;
    type: string;
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