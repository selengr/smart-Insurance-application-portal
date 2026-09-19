import { Locale } from '../../../i18n.config'
import InsurancePage from "@/sections/home-page/home-page";
import BackgroundPaths from '@/components/background-paths/background-paths';

export default async function Home({
  params
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params;

  return (
    <BackgroundPaths>
      <InsurancePage lang={lang} />
    </BackgroundPaths>
  )
}
