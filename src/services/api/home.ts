import { AxiosResponse } from "axios";
import httpService from "../http-service";
import { InsuranceForm } from "@/types/insurance";

export const fetchInsuranceTypes = async (): Promise<AxiosResponse<InsuranceForm[]>> => (
     await httpService.get(`/api/insurance/forms`)
)