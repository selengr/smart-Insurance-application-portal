import type { InsuranceForm } from "@/types/insurance";

export const mockInsuranceForms: InsuranceForm[] = [
  {
    formId: "health_insurance_application",
    title: "Health Insurance Application",
    fields: [
      {
        id: "personal_info",
        label: "Personal Information",
        type: "group",
        fields: [
          { id: "first_name", label: "First Name", type: "text", required: true },
          { id: "last_name", label: "Last Name", type: "text", required: true },
          { id: "age", label: "Age", type: "number", required: true, validation: { min: 0, max: 120 } },
        ],
      },
      {
        id: "coverage",
        label: "Coverage Type",
        type: "select",
        required: true,
        options: ["Basic", "Standard", "Premium"],
      },
    ],
  },
  {
    formId: "home_insurance_application",
    title: "Home Insurance Application",
    fields: [
      {
        id: "address",
        label: "Address",
        type: "group",
        fields: [
          {
            id: "country",
            label: "Country",
            type: "select",
            required: true,
            options: ["France", "Iran", "Germany"],
          },
          { id: "city", label: "City", type: "text", required: true },
        ],
      },
    ],
  },
  {
    formId: "car_insurance_application",
    title: "Car Insurance Application",
    fields: [
      { id: "make", label: "Make", type: "text", required: true },
      { id: "model", label: "Model", type: "text", required: true },
      { id: "year", label: "Year", type: "number", required: true, validation: { min: 1980, max: 2030 } },
    ],
  },
];

export const mockPurchasedColumns = [
  "id",
  "Insurance Type",
  "Applicant",
  "Submitted At",
  "Status",
];

export const mockPurchasedRows = [
  {
    id: "app-1",
    "Insurance Type": "Health",
    Applicant: "Demo User",
    "Submitted At": "2026-01-12",
    Status: "Approved",
  },
  {
    id: "app-2",
    "Insurance Type": "Home",
    Applicant: "Demo User",
    "Submitted At": "2026-02-03",
    Status: "In Review",
  },
];

export const isMockApiEnabled = () =>
  process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
