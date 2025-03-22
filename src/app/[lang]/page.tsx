import { Locale } from '../../../i18n.config'
import InsurancePage from "@/components/home-page/home-page";

export default async function Home({
  params: { lang }
}: {
  params: { lang: Locale }
}) {

  return <InsurancePage lang={lang}/>
}
