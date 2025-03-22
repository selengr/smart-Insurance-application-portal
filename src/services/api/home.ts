import { InsuranceForm } from "@/types/insurance";
import httpService from "../http-service";
import { AxiosResponse } from "axios";

export const fetchInsuranceTypes = async (): Promise<AxiosResponse<InsuranceForm[]>> => (
     await httpService.get(`/api/insurance/forms`)
)