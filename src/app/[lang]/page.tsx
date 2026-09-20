import type { Metadata } from "next"
import { Locale } from '../../../i18n.config'
import InsurancePage from "@/sections/home-page/home-page";
import BackgroundPaths from '@/components/background-paths/background-paths';
import { getDictionary } from "@/lib/dictionary"
import { buildPageMetadata } from "@/lib/page-metadata"

type Params = Promise<{ lang: Locale }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { lang } = await params
  const { page } = await getDictionary(lang)

  return buildPageMetadata({
    title: page.home.title,
    description: page.home.description,
    lang,
    path: "",
    image: "/images/hero-living.jpg",
    imageAlt: page.home.brand,
  })
}

export default async function Home({
  params
}: {
  params: Params
}) {
  const { lang } = await params;

  return (
    <BackgroundPaths>
      <InsurancePage lang={lang} />
    </BackgroundPaths>
  )
}
