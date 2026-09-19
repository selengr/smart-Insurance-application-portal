import { Locale } from "../../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"
import { DynamicApplicationsList } from "@/sections/application-list/dynamic-applications-list"

export default async function PurchasedInsurancesPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const { page } = await getDictionary(lang)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          {page.policies.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{page.policies.subtitle}</p>
      </header>
      <DynamicApplicationsList />
    </div>
  )
}
