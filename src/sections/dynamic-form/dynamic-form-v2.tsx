"use client"

import Link from "next/link"
import type React from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ArrowRight, Save, ShieldCheck } from "lucide-react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef, useCallback } from "react"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { FormValues, InsuranceField } from "@/types/insurance"
import { renderFormField } from "./render-form-field"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSubmitForm } from "@/hooks/use-submit-form"
import { dynamicOptionsApi } from "@/services/api/insurance-forms"
import { useFetchInsuranceForms } from "@/hooks/use-fetch-insurance-forms"
import { ApplicationHero } from "@/sections/application/application-hero"
import { ApplicationStepper } from "@/sections/application/application-stepper"
import { buildReviewRows } from "@/lib/review-rows"

type FormCopy = {
  saveDraft: string
  saving: string
  submit: string
  submitting: string
  cancel: string
  back: string
  continueReview: string
  editDetails: string
  progress: string
  fieldsStarted: string
  lastSaved: string
  autosave: string
  loadError: string
  notFound: string
  connectionHint: string
  submittedTitle: string
  submittedBody: string
  submitFailedTitle: string
  submitFailedBody: string
  draftSavedTitle: string
  draftSavedBody: string
  draftRestoredTitle: string
  draftRestoredBody: string
  backProducts: string
  stepDetails: string
  stepReview: string
  stepConfirm: string
  journeyLabel: string
  reviewTitle: string
  reviewSubtitle: string
  reviewEmpty: string
  secureNote: string
  requiredHint: string
}

interface IDynamicFormProps {
  formId: string
  lang: string
  copy: FormCopy
  productBlurb?: string
}

const isIsoDateString = (value: string) =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)

const processDraftDates = (draft: FormValues): FormValues => {
  const result: FormValues = { ...draft }
  delete result._lastSaved

  Object.keys(result).forEach((key) => {
    const value = result[key]
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = processDraftDates(value as FormValues)
    } else if (typeof value === "string" && isIsoDateString(value)) {
      result[key] = new Date(value)
    }
  })

  return result
}

type FlowStep = "details" | "review"

const DynamicForm: React.FC<IDynamicFormProps> = ({ formId, lang, copy, productBlurb }) => {
  const { push } = useRouter()
  const [flowStep, setFlowStep] = useState<FlowStep>("details")
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data, isFetching: isLoading, isError, error, refetch } = useFetchInsuranceForms(formId)
  const formData = data?.form || null
  const formSchema = data?.schema || null

  const { mutate: submitForm, isPending: isSubmitingForm } = useSubmitForm()

  const form = useForm<FormValues>({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    mode: "onBlur",
  })

  useEffect(() => {
    if (!formData || !formSchema) return

    try {
      const savedDraft = localStorage.getItem(`form_draft_${formId}`)
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft) as FormValues
        const processedDraft = processDraftDates(parsedDraft)
        form.reset(processedDraft)

        toast(copy.draftRestoredTitle, {
          description: copy.draftRestoredBody,
          duration: 3000,
        })

        const savedAt = parsedDraft._lastSaved
        setLastSaved(new Date(typeof savedAt === "string" ? savedAt : Date.now()))
      }
    } catch (err) {
      console.error("Error loading draft:", err)
    }
  }, [formData, formId, form, formSchema, copy.draftRestoredBody, copy.draftRestoredTitle])

  const saveDraft = useCallback(() => {
    if (!formData) return

    setIsSaving(true)
    const formValues = form.getValues()
    const draftToSave = {
      ...formValues,
      _lastSaved: new Date().toISOString(),
    }
    localStorage.setItem(`form_draft_${formId}`, JSON.stringify(draftToSave))
    setLastSaved(new Date())
    setIsSaving(false)
  }, [form, formData, formId])

  useEffect(() => {
    if (!formData) return
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setInterval(() => {
      saveDraft()
    }, 30000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
  }, [formData, saveDraft])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(`form_draft_${formId}`)
    setLastSaved(null)
  }, [formId])

  const fetchDynamicOptions = async (field: InsuranceField, dependentValue: string) => {
    if (!field.dynamicOptions) return
    try {
      const response = await dynamicOptionsApi(field, dependentValue)
      setDynamicOptions((prev) => ({
        ...prev,
        [field.id]: response,
      }))
    } catch (err) {
      console.error(`Error fetching options for ${field.id}:`, err)
      toast.error("Could not load options", {
        description: `Failed to fetch choices for ${field.label}.`,
      })
    }
  }

  const countryValue = form.watch("address.country")

  useEffect(() => {
    if (!formData) return

    const fieldsWithDynamicOptions = formData.fields.flatMap((field) =>
      field.type === "group" && field.fields
        ? field.fields.filter((f) => f.dynamicOptions)
        : field.dynamicOptions
          ? [field]
          : [],
    )

    fieldsWithDynamicOptions.forEach((field) => {
      if (!field.dynamicOptions) return
      if (typeof countryValue === "string" && countryValue) {
        void fetchDynamicOptions(field, countryValue)
      }
    })
  }, [countryValue, formData, formId])

  const onSubmit = (values: FormValues) => {
    submitForm(
      { data: { ...values, formId } },
      {
        onSuccess: (result) => {
          const applicationId =
            (result as { data?: { applicationId?: string } })?.data?.applicationId ||
            `APP-${Date.now().toString(36).toUpperCase()}`

          toast.success(copy.submittedTitle, {
            description: copy.submittedBody,
            duration: 4000,
          })
          clearDraft()
          form.reset()
          push(`/${lang}/insurance/${formId}/confirmation?ref=${encodeURIComponent(applicationId)}`)
        },
        onError: () => {
          toast.error(copy.submitFailedTitle, {
            description: copy.submitFailedBody,
          })
        },
      },
    )
  }

  const goToReview = async () => {
    const valid = await form.trigger()
    if (!valid) {
      toast.error(copy.requiredHint)
      return
    }
    saveDraft()
    setFlowStep("review")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleManualSave = () => {
    saveDraft()
    toast.success(copy.draftSavedTitle, {
      description: copy.draftSavedBody,
      duration: 3000,
    })
  }

  const stepIndex = flowStep === "details" ? 0 : 1
  const steps = [
    { id: "details", label: copy.stepDetails },
    { id: "review", label: copy.stepReview },
    { id: "confirm", label: copy.stepConfirm },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse" role="status" aria-live="polite">
        <div className="h-40 w-full rounded bg-muted" />
        <div className="h-8 w-1/2 rounded bg-muted" />
        <div className="h-12 w-full rounded bg-muted" />
        <div className="h-12 w-full rounded bg-muted" />
        <span className="sr-only">Loading form…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div
        className="border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3"
        role="alert"
      >
        <p className="font-medium">{copy.loadError}</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : copy.connectionHint}
        </p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="border p-8 text-center text-muted-foreground" role="status">
        {copy.notFound}
      </div>
    )
  }

  const watched = form.watch()
  const filledCount = Object.values(watched).filter(
    (v) => v !== undefined && v !== null && v !== "",
  ).length
  const totalFields = formData.fields.reduce(
    (acc, field) => acc + (field.type === "group" && field.fields ? field.fields.length : 1),
    0,
  )
  const progressPct = totalFields ? Math.min(100, (filledCount / totalFields) * 100) : 0
  const reviewRows = buildReviewRows(formData.fields, watched)

  return (
    <div>
      <ApplicationHero
        lang={lang}
        formId={formId}
        title={formData.title}
        blurb={productBlurb}
        backLabel={copy.backProducts}
        stepLabel={copy.journeyLabel}
      />

      <div className="mb-8 border border-border/80 bg-card/50 px-4 py-4 sm:px-6">
        <ApplicationStepper steps={steps} currentIndex={stepIndex} />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
          onKeyDown={(e) => {
            if (e.key === "Enter" && flowStep === "details" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
              e.preventDefault()
            }
          }}
        >
          {flowStep === "details" ? (
            <>
              <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {copy.progress}: {Math.min(filledCount, totalFields)} / {totalFields}{" "}
                    {copy.fieldsStarted}
                  </p>
                  <div
                    className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted"
                    aria-hidden
                  >
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {lastSaved ? (
                    <span className="text-xs text-muted-foreground">
                      {copy.lastSaved}: {format(lastSaved, "h:mm a")}
                    </span>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleManualSave}
                    disabled={isSaving}
                    className="gap-1.5"
                    aria-label={copy.saveDraft}
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? copy.saving : copy.saveDraft}
                  </Button>
                </div>
              </div>

              <div className="space-y-5">
                {formData.fields.map((field) =>
                  renderFormField(field, "", form.control, form.watch, dynamicOptions),
                )}
              </div>

              <p className="text-xs text-muted-foreground">{lastSaved ? copy.autosave : copy.secureNote}</p>

              <div className="flex flex-wrap gap-3 border-t border-border pt-6">
                <Button type="button" onClick={goToReview} className="gap-2">
                  {copy.continueReview}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                </Button>
                <Button asChild variant="outline" type="button">
                  <Link href={`/${lang}/`}>{copy.cancel}</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
                  {copy.reviewTitle}
                </h2>
                <p className="text-sm text-muted-foreground">{copy.reviewSubtitle}</p>
              </div>

              <div className="border border-border bg-background/60">
                {reviewRows.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">{copy.reviewEmpty}</p>
                ) : (
                  <dl className="divide-y divide-border">
                    {reviewRows.map((row) => (
                      <div
                        key={row.path}
                        className="grid gap-1 px-5 py-4 sm:grid-cols-[minmax(9rem,14rem)_1fr] sm:gap-6"
                      >
                        <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {row.label}
                        </dt>
                        <dd className="text-sm font-medium text-foreground">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              <div className="flex items-start gap-3 border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <p>{copy.secureNote}</p>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-border pt-6">
                <Button type="submit" disabled={isSubmitingForm} className="gap-2">
                  {isSubmitingForm ? copy.submitting : copy.submit}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFlowStep("details")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                >
                  {copy.editDetails}
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  )
}

export default DynamicForm
