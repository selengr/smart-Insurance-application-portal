import { AxiosResponse } from "axios";
import httpService from "../http-service";
import { InsuranceForm } from "@/types/insurance";

export const fetchInsuranceForms = async (formId: string): Promise<InsuranceForm | undefined> => {
     const response = await httpService.get<InsuranceForm[]>(`/api/insurance/forms`)
     return response.data.find((f:InsuranceForm) => f.formId === formId);
}
