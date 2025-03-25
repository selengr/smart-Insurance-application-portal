import { Locale } from '../../../i18n.config'
import { getDictionary } from '@/lib/dictionary';
import InsurancePage from "@/sections/home-page/home-page";
import BackgroundPaths from '@/components/background-paths/background-paths';

export default async function Home({
  params
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params;
  const { page } = await getDictionary(lang)

  return <BackgroundPaths title={page.home.title} lang={lang}>
        <InsurancePage lang={lang}/>
    </BackgroundPaths>
}
