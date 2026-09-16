import { AxiosResponse } from "axios";
import httpService from "../http-service";
import { InsuranceForm } from "@/types/insurance";
import { isMockApiEnabled, mockInsuranceForms } from "@/mocks/fixtures";

export const fetchInsuranceTypes = async (): Promise<AxiosResponse<InsuranceForm[]>> => {
  if (isMockApiEnabled()) {
    return {
      data: mockInsuranceForms,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as AxiosResponse["config"],
    };
  }

  return await httpService.get(`/api/insurance/forms`);
};
