import type { Metadata } from "next"
import { SITE_URL, DEFAULT_OG_IMAGE } from "../../config-global"

type PageMetaInput = {
  title: string
  description: string
  lang: string
  path?: string
  image?: string
  imageAlt?: string
}

export function buildPageMetadata({
  title,
  description,
  lang,
  path = "",
  image = DEFAULT_OG_IMAGE,
  imageAlt,
}: PageMetaInput): Metadata {
  const url = `${SITE_URL}/${lang}${path}`
  const ogImage = image.startsWith("http") ? image : `${SITE_URL}${image}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en${path}`,
        fa: `${SITE_URL}/fa${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      locale: lang === "fa" ? "fa_IR" : "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: imageAlt ?? title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}
