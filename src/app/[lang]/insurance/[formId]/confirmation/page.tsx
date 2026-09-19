import Link from "next/link"
import { Locale } from "../../../../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale; formId: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { lang, formId } = await params
  const { ref } = await searchParams
  const { page } = await getDictionary(lang)
  const reference = ref || "PENDING"

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col justify-center px-4 py-16">
      <div className="border border-border bg-card/80 p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden />
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          {page.confirmation.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{page.confirmation.subtitle}</p>
        <div className="mt-6 rounded-md bg-muted/60 px-4 py-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {page.confirmation.reference}
          </p>
          <p className="mt-1 font-mono text-lg font-semibold">{reference}</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href={`/${lang}/purchased-insurances`}>
              {page.confirmation.viewPolicies}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${lang}/insurance/${formId}`}>
              {page.confirmation.applyAnother}
            </Link>
          </Button>
        </div>
        <Link
          href={`/${lang}`}
          className="mt-6 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {page.confirmation.backHome}
        </Link>
      </div>
    </main>
  )
}
