import httpService from "../http-service";
import { InsuranceField, InsuranceForm } from "@/types/insurance";
import { isMockApiEnabled, mockInsuranceForms } from "@/mocks/fixtures";

enum METHOD {
  GET = "get",
  POST = "post",
}

interface IFormValues {
  [key: string]: unknown;
}

export const insuranceFormsApi = async (formId: string): Promise<InsuranceForm | undefined> => {
  if (isMockApiEnabled()) {
    return mockInsuranceForms.find((f) => f.formId === formId);
  }

  const response = await httpService.get(`/api/insurance/forms`);
  return response.data.find((f: InsuranceForm) => f.formId === formId);
};

export const dynamicOptionsApi = async (field: InsuranceField, dependentValue: string) => {
  if (!field.dynamicOptions) return [];

  if (isMockApiEnabled()) {
    const citiesByCountry: Record<string, string[]> = {
      France: ["Paris", "Lyon", "Marseille"],
      Iran: ["Tehran", "Isfahan", "Shiraz"],
      Germany: ["Berlin", "Munich", "Hamburg"],
    };
    return citiesByCountry[dependentValue] || [];
  }

  const method = field.dynamicOptions.method as "GET" | "POST";
  const response = await httpService[METHOD[method]](`${field.dynamicOptions.endpoint}`, {
    [field.dynamicOptions.dependsOn]: dependentValue,
  });

  return response.data.states || [];
};

export const submitFormApi = async (data: IFormValues) => {
  if (isMockApiEnabled()) {
    return { data: { ok: true, received: data }, status: 200 };
  }

  return await httpService.post("/api/insurance/forms/submit", { data });
};
