import Image from "next/image"
import Link from "next/link"
import { Locale } from "../../../../../../i18n.config"
import { getDictionary } from "@/lib/dictionary"
import { Button } from "@/components/ui/button"
import { CheckCircle2, FolderOpen, Home } from "lucide-react"
import { ApplicationStepper } from "@/sections/application/application-stepper"
import { PRODUCT_VISUAL } from "@/lib/product-visuals"
import { insuranceTypeFromFormId } from "@/lib/local-applications"
import { statusChipClass } from "@/lib/status-styles"
import { CopyReferenceButton } from "@/components/copy-reference-button"
import { ConfirmationEstimate } from "@/sections/application/confirmation-estimate"
import { ConfirmationMotion } from "@/sections/application/confirmation-motion"
import { PrintReceiptButton } from "@/components/print-receipt-button"
import { ConfirmationRecentTracker } from "@/components/confirmation-recent-tracker"

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
  const hasRef = Boolean(ref && ref !== "PENDING")
  const reference = hasRef ? ref! : null
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
    <main className="relative mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      {reference ? <ConfirmationRecentTracker reference={reference} /> : null}
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.06_195_/_0.16),_transparent_70%)]"
        aria-hidden
      />

      <div className="mb-8 border border-border/80 bg-card/50 px-4 py-4 sm:px-6" data-print-hide>
        <ApplicationStepper steps={steps} currentIndex={2} ariaLabel={page.form.journeyLabel} />
      </div>

      <div className="print-receipt relative overflow-hidden border border-border">
        <div className="absolute inset-0">
          <Image src={visual.src} alt="" fill className="object-cover opacity-30" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/95 to-background" />
        </div>

        <div className="relative px-6 py-12 text-center sm:px-10 sm:py-14">
          <ConfirmationMotion>
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
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {page.confirmation.receiptTitle}
              </p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold ${statusChipClass("Pending")}`}
              >
                {page.confirmation.statusPending}
              </span>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {page.confirmation.reference}
                </p>
                {reference ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="font-mono text-lg font-semibold tracking-wide">{reference}</p>
                    <CopyReferenceButton
                      value={reference}
                      copyLabel={page.confirmation.copyReference}
                      copiedLabel={page.confirmation.copiedReference}
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {page.confirmation.missingReference}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {page.home.InsuranceTypes}
                </p>
                <p className="mt-1 text-sm font-medium">{product}</p>
              </div>
              {reference ? (
                <ConfirmationEstimate
                  applicationId={reference}
                  label={page.confirmation.estimate}
                  lang={lang}
                />
              ) : null}
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-md border-t border-border pt-6 text-start">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              {page.confirmation.nextTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{page.confirmation.nextBody}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center" data-print-hide>
            <Button asChild>
              <Link
                href={
                  reference
                    ? `/${lang}/purchased-insurances/${reference}`
                    : `/${lang}/purchased-insurances`
                }
                className="gap-2"
              >
                <FolderOpen className="h-4 w-4" aria-hidden />
                {page.confirmation.viewPolicies}
              </Link>
            </Button>
            <PrintReceiptButton label={page.confirmation.printReceipt} />
            <Button asChild variant="outline">
              <Link href={`/${lang}/insurance/${formId}`}>{page.confirmation.applyAnother}</Link>
            </Button>
          </div>

          <Link
            href={`/${lang}`}
            data-print-hide
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            {page.confirmation.backHome}
          </Link>
          </ConfirmationMotion>
        </div>
      </div>
    </main>
  )
}
