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
    const local = getLocalApplications().map((row) => ({
      id: row.id,
      "Insurance Type": row["Insurance Type"],
      Applicant: row.Applicant,
      "Submitted At": row["Submitted At"],
      Status: row.Status,
      ...(row.formId ? { formId: row.formId } : {}),
      ...(typeof row.monthlyEstimate === "number"
        ? { monthlyEstimate: row.monthlyEstimate }
        : {}),
    }))
    const fixtures = mockPurchasedRows.map((row) => ({
      id: row.id,
      "Insurance Type": row["Insurance Type"],
      Applicant: row.Applicant,
      "Submitted At": row["Submitted At"],
      Status: row.Status,
      formId: row.formId,
      ...(typeof row.monthlyEstimate === "number"
        ? { monthlyEstimate: row.monthlyEstimate }
        : {}),
    }))
    const merged = [
      ...local,
      ...fixtures.filter(
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
