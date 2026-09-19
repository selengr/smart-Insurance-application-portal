import httpService from "../http-service";
import { ITabelData } from "@/types/purchased-insurances";
import {
  isMockApiEnabled,
  mockPurchasedColumns,
  mockPurchasedRows,
} from "@/mocks/fixtures";
import { getLocalApplications } from "@/lib/local-applications";

export const purchasedInsurancesApi = async (): Promise<ITabelData> => {
  if (isMockApiEnabled()) {
    const local = getLocalApplications();
    const merged = [
      ...local,
      ...mockPurchasedRows.filter(
        (row) => !local.some((localRow) => localRow.id === row.id),
      ),
    ];
    return {
      columns: mockPurchasedColumns,
      data: merged,
    };
  }

  const { data } = await httpService.get<ITabelData>(`/api/insurance/forms/submissions`);
  return data as ITabelData;
};
