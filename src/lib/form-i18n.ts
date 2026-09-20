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

export type FieldLabelEntry = {
  label: string
  options?: Record<string, string>
}

/** Flat id → label/options index from page.forms for a product. */
export function buildFormFieldLabelIndex(
  catalog: FormsCatalog | undefined,
  formId: string,
): Record<string, FieldLabelEntry> {
  const index: Record<string, FieldLabelEntry> = {}

  const walk = (fields?: Record<string, FieldOverride>) => {
    if (!fields) return
    for (const [id, override] of Object.entries(fields)) {
      if (override.label || override.options) {
        index[id] = {
          label: override.label ?? id,
          options: override.options,
        }
      }
      if (override.fields) walk(override.fields)
    }
  }

  walk(catalog?.[formId]?.fields)
  return index
}

export function labelForFieldKey(
  key: string,
  index: Record<string, FieldLabelEntry>,
) {
  return index[key]?.label ?? key.replaceAll("_", " ")
}

export function localizeStoredAnswerValue(
  value: string,
  fieldKey: string,
  index: Record<string, FieldLabelEntry>,
  lang: string,
) {
  const fromField = index[fieldKey]?.options?.[value]
  if (fromField) return fromField

  const pack = DYNAMIC_OPTION_I18N[lang]
  if (!pack) return value
  if (pack.countries[value]) return pack.countries[value]
  if (pack.carModels[value]) return pack.carModels[value]
  for (const cityMap of Object.values(pack.cities)) {
    if (cityMap[value]) return cityMap[value]
  }
  return value
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
  {
    countries: Record<string, string>
    cities: Record<string, Record<string, string>>
    carModels: Record<string, string>
  }
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
    carModels: {
      Corolla: "کرولا",
      Camry: "کمری",
      RAV4: "RAV4",
      Yaris: "یاریس",
      Elantra: "النترا",
      Tucson: "توسان",
      "Santa Fe": "سانتافه",
      i20: "i20",
      "320i": "320i",
      X3: "X3",
      X5: "X5",
      "530i": "530i",
      C200: "C200",
      E300: "E300",
      GLC: "GLC",
      A180: "A180",
      "Peugeot 206": "پژو ۲۰۶",
      Samand: "سمند",
      Dena: "دنا",
      Tara: "تارا",
      Sportage: "اسپورتیج",
      Cerato: "سراتو",
      Sorento: "سورنتو",
      Rio: "ریو",
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

export function localizeDynamicOptions(
  lang: string,
  dependsOn: string,
  dependentValue: string,
  options: string[],
) {
  if (dependsOn === "country") {
    return localizeDynamicCities(lang, dependentValue, options)
  }
  if (dependsOn === "make") {
    const map = DYNAMIC_OPTION_I18N[lang]?.carModels
    if (!map) return options
    return options.map((opt) => map[opt] ?? opt)
  }
  return options
}

export function localizeCountryName(lang: string, country: string) {
  return DYNAMIC_OPTION_I18N[lang]?.countries[country] ?? country
}
