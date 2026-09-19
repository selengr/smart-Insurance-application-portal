import httpService from "../http-service";
import { InsuranceField, InsuranceForm } from "@/types/insurance";
import {
  isMockApiEnabled,
  mockCarModelsByMake,
  mockInsuranceForms,
} from "@/mocks/fixtures";

enum METHOD {
  GET = "get",
  POST = "post",
}

interface IFormValues {
  [key: string]: unknown;
}

const citiesByCountry: Record<string, string[]> = {
  France: ["Paris", "Lyon", "Marseille"],
  Iran: ["Tehran", "Isfahan", "Shiraz"],
  Germany: ["Berlin", "Munich", "Hamburg"],
  فرانسه: ["Paris", "Lyon", "Marseille"],
  ایران: ["Tehran", "Isfahan", "Shiraz"],
  آلمان: ["Berlin", "Munich", "Hamburg"],
};

/** Resolve localized brand labels back to English fixture keys */
const carMakeAliases: Record<string, string> = {
  Toyota: "Toyota",
  Hyundai: "Hyundai",
  BMW: "BMW",
  "Mercedes-Benz": "Mercedes-Benz",
  "Iran Khodro": "Iran Khodro",
  Kia: "Kia",
  تویوتا: "Toyota",
  هیوندای: "Hyundai",
  بی‌ام‌و: "BMW",
  "مرسدس بنز": "Mercedes-Benz",
  ایران‌خودرو: "Iran Khodro",
  کیا: "Kia",
};

export const insuranceFormsApi = async (formId: string): Promise<InsuranceForm | undefined> => {
  if (isMockApiEnabled()) {
    return mockInsuranceForms.find((f) => f.formId === formId);
  }

  const response = await httpService.get<InsuranceForm[]>(`/api/insurance/forms`);
  const forms = response.data as InsuranceForm[];
  return forms.find((f) => f.formId === formId);
};

export const dynamicOptionsApi = async (field: InsuranceField, dependentValue: string) => {
  if (!field.dynamicOptions) return [];

  if (isMockApiEnabled()) {
    const endpoint = field.dynamicOptions.endpoint || "";

    if (endpoint.includes("getCarModels") || field.dynamicOptions.dependsOn === "make") {
      const key = carMakeAliases[dependentValue] || dependentValue;
      return mockCarModelsByMake[key] || [];
    }

    return citiesByCountry[dependentValue] || [];
  }

  const method = field.dynamicOptions.method as "GET" | "POST";
  const response = await httpService[METHOD[method]](`${field.dynamicOptions.endpoint}`, {
    [field.dynamicOptions.dependsOn]: dependentValue,
  });

  const payload = response.data as { states?: string[] };
  return payload.states || [];
};

export const submitFormApi = async (data: IFormValues & { formId?: string }) => {
  if (isMockApiEnabled()) {
    const applicationId = `APP-${Date.now().toString(36).toUpperCase()}`
    if (typeof window !== "undefined" && data.formId) {
      const { recordMockSubmission } = await import("@/lib/local-applications")
      const { formId, ...payload } = data
      recordMockSubmission(formId, payload, applicationId)
    }
    return {
      data: { ok: true, applicationId, received: data },
      status: 200,
    }
  }

  return await httpService.post("/api/insurance/forms/submit", { data })
}
