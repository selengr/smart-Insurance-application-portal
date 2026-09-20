import type { Metadata } from "next"
import { Locale } from '../../../../../i18n.config'
import { getDictionary } from "@/lib/dictionary"
import { buildPageMetadata } from "@/lib/page-metadata"

type Params = Promise<{ lang: Locale; id: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { lang, id } = await params
  const { page } = await getDictionary(lang)

  return buildPageMetadata({
    title: page.policyDetail.metaTitle,
    description: `${page.policyDetail.metaDescription} (${id})`,
    lang,
    path: `/purchased-insurances/${id}`,
  })
}

export default function PolicyDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
