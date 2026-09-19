import type { MetadataRoute } from "next"
import { i18n } from "../../i18n.config"

const base = "https://smart-insurance-application-portal.liara.run"

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/purchased-insurances", "/login"]

  return i18n.locales.flatMap((lang) =>
    paths.map((path) => ({
      url: `${base}/${lang}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
  )
}
