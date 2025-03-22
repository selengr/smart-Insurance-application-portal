import httpService from "../http-service";
import { InsuranceField, InsuranceForm } from "@/types/insurance";

export const fetchInsuranceForms = async (formId: string): Promise<InsuranceForm | undefined> => {
     const response = await httpService.get<InsuranceForm[]>(`/api/insurance/forms`)
     return response.data.find((f:InsuranceForm) => f.formId === formId);
}

enum METHOD {
    GET = "get",
    POST = "post"
}

export const dynamicOptionsApi = async (field: InsuranceField,dependentValue:string) => {
    if (!field.dynamicOptions) return [];

    const method = field.dynamicOptions.method as "GET" | "POST" ;
    const response = await httpService[METHOD[method]](`${field.dynamicOptions.endpoint}`,{[field.dynamicOptions.dependsOn]: dependentValue} );
  
    return response.data.states || [];
  };