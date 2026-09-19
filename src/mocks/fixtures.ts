import type { InsuranceForm } from "@/types/insurance";

const CAR_YEARS = Array.from({ length: 2026 - 1995 + 1 }, (_, i) => String(2026 - i));

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
          {
            id: "gender",
            label: "Gender",
            type: "select",
            required: true,
            options: ["Female", "Male", "Prefer not to say"],
          },
        ],
      },
      {
        id: "coverage",
        label: "Coverage Type",
        type: "select",
        required: true,
        options: ["Basic", "Standard", "Premium"],
      },
      {
        id: "network",
        label: "Provider network",
        type: "select",
        required: true,
        options: ["In-network only", "In + out of network", "International"],
      },
      {
        id: "smoker",
        label: "Do you smoke?",
        type: "radio",
        required: true,
        options: ["No", "Yes"],
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
          {
            id: "city",
            label: "City",
            type: "select",
            required: true,
            dynamicOptions: {
              dependsOn: "country",
              endpoint: "/api/getCities",
              method: "GET",
            },
          },
        ],
      },
      {
        id: "property_type",
        label: "Property type",
        type: "select",
        required: true,
        options: ["Apartment", "House", "Villa", "Townhouse"],
      },
      {
        id: "ownership",
        label: "Ownership",
        type: "radio",
        required: true,
        options: ["Owner", "Tenant"],
      },
      {
        id: "contents_cover",
        label: "Contents cover",
        type: "select",
        required: true,
        options: ["None", "Standard", "High value"],
      },
    ],
  },
  {
    formId: "car_insurance_application",
    title: "Car Insurance Application",
    fields: [
      {
        id: "vehicle",
        label: "Vehicle",
        type: "group",
        fields: [
          {
            id: "make",
            label: "Brand",
            type: "select",
            required: true,
            options: ["Toyota", "Hyundai", "BMW", "Mercedes-Benz", "Iran Khodro", "Kia"],
          },
          {
            id: "model",
            label: "Model",
            type: "select",
            required: true,
            dynamicOptions: {
              dependsOn: "make",
              endpoint: "/api/getCarModels",
              method: "GET",
            },
          },
          {
            id: "year",
            label: "Year",
            type: "select",
            required: true,
            options: CAR_YEARS,
          },
        ],
      },
      {
        id: "usage",
        label: "Usage",
        type: "select",
        required: true,
        options: ["Personal", "Business", "Ride-share"],
      },
      {
        id: "coverage_level",
        label: "Coverage level",
        type: "radio",
        required: true,
        options: ["Third party", "Comprehensive", "Full cover"],
      },
    ],
  },
  {
    formId: "life_insurance_application",
    title: "Life Insurance Application",
    fields: [
      { id: "full_name", label: "Full name", type: "text", required: true },
      {
        id: "age_band",
        label: "Age band",
        type: "select",
        required: true,
        options: ["18–30", "31–45", "46–60", "61+"],
      },
      {
        id: "coverage_amount",
        label: "Coverage amount",
        type: "select",
        required: true,
        options: ["$50,000", "$100,000", "$250,000", "$500,000"],
      },
      {
        id: "term",
        label: "Term length",
        type: "radio",
        required: true,
        options: ["10 years", "20 years", "30 years"],
      },
      {
        id: "smoker",
        label: "Smoker status",
        type: "select",
        required: true,
        options: ["Non-smoker", "Smoker"],
      },
      {
        id: "beneficiary",
        label: "Primary beneficiary",
        type: "select",
        required: true,
        options: ["Spouse", "Child", "Parent", "Other"],
      },
    ],
  },
];

export const mockCarModelsByMake: Record<string, string[]> = {
  Toyota: ["Corolla", "Camry", "RAV4", "Yaris"],
  Hyundai: ["Elantra", "Tucson", "Santa Fe", "i20"],
  BMW: ["320i", "X3", "X5", "530i"],
  "Mercedes-Benz": ["C200", "E300", "GLC", "A180"],
  "Iran Khodro": ["Peugeot 206", "Samand", "Dena", "Tara"],
  Kia: ["Sportage", "Cerato", "Sorento", "Rio"],
};

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
    formId: "health_insurance_application",
  },
  {
    id: "app-2",
    "Insurance Type": "Home",
    Applicant: "Demo User",
    "Submitted At": "2026-02-03",
    Status: "In Review",
    formId: "home_insurance_application",
  },
];

export const isMockApiEnabled = () => {
  const flag = process.env.NEXT_PUBLIC_USE_MOCK_API
  if (flag === "true") return true
  if (flag === "false") return false
  // Local/dev default: offline-friendly fixtures so the app runs without the remote API
  return process.env.NODE_ENV !== "production"
}
