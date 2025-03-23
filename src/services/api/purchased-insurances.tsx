import httpService from "../http-service";
import { ITabelData } from "@/types/purchased-insurances";


//------------------------------------------------------------------------------------------------------------
export const purchasedInsurancesApi = async (): Promise<ITabelData> => {
     const {data} = await httpService.get(`/api/insurance/forms/submissions`)
     return data
}
