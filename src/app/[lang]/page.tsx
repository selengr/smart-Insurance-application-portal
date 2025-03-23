import { Locale } from '../../../i18n.config'
import InsurancePage from "@/sections/home-page/home-page";

export default async function Home({
  params
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params;

  return <InsurancePage lang={lang}/>
}
