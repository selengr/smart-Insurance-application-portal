import type { MetadataRoute } from "next"
import { i18n } from "../../i18n.config"
import { SITE_URL } from "../../config-global"

const PRODUCT_FORMS = [
  "health_insurance_application",
  "home_insurance_application",
  "car_insurance_application",
  "life_insurance_application",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/purchased-insurances",
    "/login",
    "/privacy",
    "/terms",
    "/about",
    ...PRODUCT_FORMS.map((formId) => `/insurance/${formId}`),
  ]

  return i18n.locales.flatMap((lang) =>
    paths.map((path) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : path.startsWith("/insurance/") ? 0.8 : 0.7,
    })),
  )
}
