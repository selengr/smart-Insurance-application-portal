import Image from "next/image"
import Link from "next/link"
import { Locale } from "../../../../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"
import { Button } from "@/components/ui/button"
import { CheckCircle2, FolderOpen, Home } from "lucide-react"
import { ApplicationStepper } from "@/sections/application/application-stepper"
import { PRODUCT_VISUAL } from "@/lib/product-visuals"
import { insuranceTypeFromFormId } from "@/lib/local-applications"

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
  const visual =
    PRODUCT_VISUAL[formId] ?? {
      src: "/images/product-home.jpg",
      alt: formId,
    }
  const product =
    page.home.productTitles?.[formId] ?? insuranceTypeFromFormId(formId)
  const steps = [
    { id: "details", label: page.form.stepDetails },
    { id: "review", label: page.form.stepReview },
    { id: "confirm", label: page.form.stepConfirm },
  ]

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 border border-border/80 bg-card/50 px-4 py-4 sm:px-6">
        <ApplicationStepper steps={steps} currentIndex={2} />
      </div>

      <div className="relative overflow-hidden border border-border">
        <div className="absolute inset-0">
          <Image src={visual.src} alt="" fill className="object-cover opacity-30" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/95 to-background" />
        </div>

        <div className="relative px-6 py-12 text-center sm:px-10 sm:py-14">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden />
          <p className="mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary">
            {page.confirmation.stepLabel}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-4xl">
            {page.confirmation.title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            {page.confirmation.subtitle}
          </p>

          <div className="mx-auto mt-8 max-w-md border border-border bg-background/90 text-start">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {page.confirmation.receiptTitle}
              </p>
              <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                {page.confirmation.statusPending}
              </span>
            </div>
            <div className="space-y-3 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {page.confirmation.reference}
                </p>
                <p className="mt-1 font-mono text-lg font-semibold tracking-wide">{reference}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {page.home.InsuranceTypes}
                </p>
                <p className="mt-1 text-sm font-medium">{product}</p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-md border-t border-border pt-6 text-start">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              {page.confirmation.nextTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{page.confirmation.nextBody}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link
                href={
                  ref
                    ? `/${lang}/purchased-insurances/${reference}`
                    : `/${lang}/purchased-insurances`
                }
                className="gap-2"
              >
                <FolderOpen className="h-4 w-4" aria-hidden />
                {page.confirmation.viewPolicies}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/${lang}/insurance/${formId}`}>{page.confirmation.applyAnother}</Link>
            </Button>
          </div>

          <Link
            href={`/${lang}`}
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            {page.confirmation.backHome}
          </Link>
        </div>
      </div>
    </main>
  )
}
