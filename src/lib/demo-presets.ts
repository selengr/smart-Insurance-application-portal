import type { FormValues } from "@/types/insurance"

/** Demo answers so reviewers can walk the reserve flow quickly. */
export const DEMO_PRESETS: Record<string, FormValues> = {
  health_insurance_application: {
    personal_info: {
      first_name: "Sara",
      last_name: "Karimi",
      age: 32,
      gender: "Female",
    },
    coverage: "Standard",
    network: "In-network only",
    smoker: "No",
  },
  home_insurance_application: {
    address: {
      country: "Iran",
      city: "Tehran",
    },
    property_type: "Apartment",
    ownership: "Owner",
    contents_cover: "Standard",
  },
  car_insurance_application: {
    vehicle: {
      make: "Toyota",
      model: "Corolla",
      year: "2022",
    },
    usage: "Personal",
    coverage_level: "Comprehensive",
  },
  life_insurance_application: {
    full_name: "Reza Ahmadi",
    age_band: "31–45",
    coverage_amount: "$250,000",
    term: "20 years",
    smoker: "Non-smoker",
    beneficiary: "Spouse",
  },
}

/** FA-friendly demo values (labels match localized option strings). */
export const DEMO_PRESETS_FA: Record<string, FormValues> = {
  health_insurance_application: {
    personal_info: {
      first_name: "سارا",
      last_name: "کریمی",
      age: 32,
      gender: "زن",
    },
    coverage: "استاندارد",
    network: "فقط طرف قرارداد",
    smoker: "خیر",
  },
  home_insurance_application: {
    address: {
      country: "ایران",
      city: "تهران",
    },
    property_type: "آپارتمان",
    ownership: "مالک",
    contents_cover: "استاندارد",
  },
  car_insurance_application: {
    vehicle: {
      make: "تویوتا",
      model: "کرولا",
      year: "2022",
    },
    usage: "شخصی",
    coverage_level: "بدنه",
  },
  life_insurance_application: {
    full_name: "رضا احمدی",
    age_band: "۳۱–۴۵",
    coverage_amount: "۲۵۰٬۰۰۰ دلار",
    term: "۲۰ سال",
    smoker: "غیرسیگاری",
    beneficiary: "همسر",
  },
}

export function getDemoPreset(formId: string, lang: string): FormValues | undefined {
  const table = lang === "fa" ? DEMO_PRESETS_FA : DEMO_PRESETS
  return table[formId]
}
