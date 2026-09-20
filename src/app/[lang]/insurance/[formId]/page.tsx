import type { Metadata } from "next"
import { Locale } from "../../../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"
import DynamicFormV2 from "@/sections/dynamic-form/dynamic-form-v2"
import { insuranceTypeFromFormId } from "@/lib/local-applications"
import { mockInsuranceForms } from "@/mocks/fixtures"
import { PRODUCT_IMAGE_SRC } from "@/lib/product-visuals"
import { buildPageMetadata } from "@/lib/page-metadata"

type Params = Promise<{ formId: string; lang: Locale }>

const FORM_IDS = [
  ...new Set(mockInsuranceForms.map((form) => form.formId)),
]

export function generateStaticParams() {
  return FORM_IDS.map((formId) => ({ formId }))
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { formId, lang } = await params
  const { page } = await getDictionary(lang)
  const title =
    page.home.productTitles?.[formId] ?? insuranceTypeFromFormId(formId)
  const description =
    page.home.productMeta?.[formId] ?? page.home.description

  return buildPageMetadata({
    title,
    description,
    lang,
    path: `/insurance/${formId}`,
    image: PRODUCT_IMAGE_SRC[formId] ?? "/images/hero-living.jpg",
    imageAlt: title,
  })
}

export default async function Page({ params }: { params: Params }) {
  const { formId, lang } = await params
  const { page } = await getDictionary(lang)
  const productBlurb = page.home.productMeta?.[formId]

  return (
    <main className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div
        className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.18),_transparent_70%)]"
        aria-hidden
      />
      <DynamicFormV2
        formId={formId}
        lang={lang}
        copy={page.form}
        productBlurb={productBlurb}
        formsCatalog={page.forms}
      />
    </main>
  )
}
