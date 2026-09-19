import type { InsuranceField, InsuranceForm } from "@/types/insurance"

export type FieldOverride = {
  label?: string
  options?: Record<string, string>
  fields?: Record<string, FieldOverride>
}

export type FormOverride = {
  title?: string
  fields?: Record<string, FieldOverride>
}

export type FormsCatalog = Record<string, FormOverride>

export type ProductTitles = Record<string, string>

function mapOptions(options: string[] | undefined, map?: Record<string, string>) {
  if (!options?.length) return options
  if (!map) return options
  return options.map((opt) => map[opt] ?? opt)
}

function localizeField(field: InsuranceField, override?: FieldOverride): InsuranceField {
  const next: InsuranceField = {
    ...field,
    label: override?.label ?? field.label,
    options: mapOptions(field.options, override?.options),
  }

  if (field.fields?.length) {
    next.fields = field.fields.map((sub) =>
      localizeField(sub, override?.fields?.[sub.id]),
    )
  }

  return next
}

export function localizeInsuranceForm(
  form: InsuranceForm,
  catalog?: FormsCatalog,
): InsuranceForm {
  const override = catalog?.[form.formId]
  if (!override) return form

  return {
    ...form,
    title: override.title ?? form.title,
    fields: form.fields.map((field) => localizeField(field, override.fields?.[field.id])),
  }
}

export function localizeProductTitle(
  formId: string,
  fallback: string,
  titles?: ProductTitles,
) {
  return titles?.[formId] ?? fallback
}

/** Map known English option/status values back for display when catalog has translations */
export function translateKnownValue(
  value: string,
  maps: Array<Record<string, string> | undefined>,
) {
  for (const map of maps) {
    if (map?.[value]) return map[value]
  }
  return value
}

export const DYNAMIC_OPTION_I18N: Record<
  string,
  { countries: Record<string, string>; cities: Record<string, Record<string, string>> }
> = {
  fa: {
    countries: {
      France: "فرانسه",
      Iran: "ایران",
      Germany: "آلمان",
    },
    cities: {
      France: { Paris: "پاریس", Lyon: "لیون", Marseille: "مارسی" },
      Iran: { Tehran: "تهران", Isfahan: "اصفهان", Shiraz: "شیراز" },
      Germany: { Berlin: "برلین", Munich: "مونیخ", Hamburg: "هامبورگ" },
      فرانسه: { Paris: "پاریس", Lyon: "لیون", Marseille: "مارسی" },
      ایران: { Tehran: "تهران", Isfahan: "اصفهان", Shiraz: "شیراز" },
      آلمان: { Berlin: "برلین", Munich: "مونیخ", Hamburg: "هامبورگ" },
    },
  },
}

export function localizeDynamicCities(lang: string, country: string, cities: string[]) {
  const pack = DYNAMIC_OPTION_I18N[lang]
  if (!pack) return cities
  const cityMap = pack.cities[country]
  if (!cityMap) return cities
  return cities.map((c) => cityMap[c] ?? c)
}

export function localizeCountryName(lang: string, country: string) {
  return DYNAMIC_OPTION_I18N[lang]?.countries[country] ?? country
}
