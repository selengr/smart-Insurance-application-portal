import httpService from "../http-service";
import { ITabelData } from "@/types/purchased-insurances";
import {
  isMockApiEnabled,
  mockPurchasedColumns,
  mockPurchasedRows,
} from "@/mocks/fixtures";

export const purchasedInsurancesApi = async (): Promise<ITabelData> => {
  if (isMockApiEnabled()) {
    return {
      columns: mockPurchasedColumns,
      data: mockPurchasedRows,
    };
  }

  const { data } = await httpService.get<ITabelData>(`/api/insurance/forms/submissions`);
  return data as ITabelData;
};
