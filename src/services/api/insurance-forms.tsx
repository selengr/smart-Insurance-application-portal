import httpService from "../http-service";
import { InsuranceField, InsuranceForm } from "@/types/insurance";

enum METHOD {
    GET = "get",
    POST = "post"
}

interface IFormValues {
    [key: string]: unknown;
  }

//------------------------------------------------------------------------------------------------------------
export const insuranceFormsApi = async (formId: string): Promise<InsuranceForm | undefined> => {
     const response = await httpService.get(`/api/insurance/forms`)
     return response.data.find((f:InsuranceForm) => f.formId === formId);
}

export const dynamicOptionsApi = async (field: InsuranceField,dependentValue:string) => {
    if (!field.dynamicOptions) return [];

    const method = field.dynamicOptions.method as "GET" | "POST" ;
    const response = await httpService[METHOD[method]](`${field.dynamicOptions.endpoint}`,{[field.dynamicOptions.dependsOn]: dependentValue} );
  
    return response.data.states || [];
};



export const submitFormApi = async (data: IFormValues) => (
     await httpService.post("/api/insurance/forms/submit",{data})   
)