"use client"

import Link from "next/link"
import type React from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { faIR } from "date-fns/locale"
import { AnimatePresence, motion } from "motion/react"
import { ArrowLeft, ArrowRight, Save, ShieldCheck, Sparkles, Wand2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"

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
import { ApplicationTips } from "@/sections/application/application-tips"
import { buildReviewRows } from "@/lib/review-rows"
import {
  localizeDynamicOptions,
  localizeInsuranceForm,
  type FormsCatalog,
} from "@/lib/form-i18n"
import { estimateMonthlyPremium } from "@/lib/reserve-quote"
import { buildFormSections, getSectionPaths } from "@/lib/form-sections"
import { getDemoPreset } from "@/lib/demo-presets"

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
  selectPlaceholder: string
  selectDepends: string
  retry: string
  optionsLoadError: string
  optionsLoadErrorBody: string
  loadingForm: string
  pickDate: string
  yes: string
  no: string
  noOptions: string
  loadingOptions: string
  validationRequired: string
  validationNumber: string
  validationMin: string
  validationMax: string
  leaveConfirm: string
  reserveQuote: string
  reserveQuoteHint: string
  agreeLabel: string
  agreeRequired: string
  nextSection: string
  prevSection: string
  sectionOf: string
  fillDemo: string
  fillDemoDone: string
  fillDemoBody: string
  liveQuote: string
  liveQuoteEmpty: string
  tipsHeading: string
  almostThere: string
  sectionReady: string
}

interface IDynamicFormProps {
  formId: string
  lang: string
  copy: FormCopy
  productBlurb?: string
  formsCatalog?: FormsCatalog
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

function collectDynamicFields(fields: InsuranceField[], parentPath = "") {
  const found: { field: InsuranceField; path: string; dependsPath: string }[] = []
  for (const field of fields) {
    const path = parentPath ? `${parentPath}.${field.id}` : field.id
    if (field.type === "group" && field.fields) {
      found.push(...collectDynamicFields(field.fields, path))
    } else if (field.dynamicOptions) {
      const dependsPath = parentPath
        ? `${parentPath}.${field.dynamicOptions.dependsOn}`
        : field.dynamicOptions.dependsOn
      found.push({ field, path, dependsPath })
    }
  }
  return found
}

function formatQuote(amount: number, lang: string) {
  return lang === "fa"
    ? `${amount.toLocaleString("fa-IR")} تومان`
    : `$${amount.toLocaleString("en-US")}`
}

const DynamicForm: React.FC<IDynamicFormProps> = ({
  formId,
  lang,
  copy,
  productBlurb,
  formsCatalog,
}) => {
  const { push } = useRouter()
  const [flowStep, setFlowStep] = useState<FlowStep>("details")
  const [sectionIndex, setSectionIndex] = useState(0)
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevDependsRef = useRef<Record<string, string>>({})

  const validationMessages = useMemo(
    () => ({
      required: copy.validationRequired,
      invalidNumber: copy.validationNumber,
      tooSmall: copy.validationMin,
      tooBig: copy.validationMax,
    }),
    [
      copy.validationRequired,
      copy.validationNumber,
      copy.validationMin,
      copy.validationMax,
    ],
  )

  const { data, isFetching: isLoading, isError, error, refetch } = useFetchInsuranceForms(
    formId,
    validationMessages,
  )
  const rawForm = data?.form || null
  const formData = useMemo(
    () => (rawForm ? localizeInsuranceForm(rawForm, formsCatalog) : null),
    [rawForm, formsCatalog],
  )
  const formSchema = data?.schema || null
  const sections = useMemo(
    () => (formData ? buildFormSections(formData.fields) : []),
    [formData],
  )

  const { mutate: submitForm, isPending: isSubmitingForm } = useSubmitForm()

  const form = useForm<FormValues>({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    mode: "onBlur",
  })

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (form.formState.isDirty && flowStep === "details") {
        event.preventDefault()
        event.returnValue = copy.leaveConfirm
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [form.formState.isDirty, flowStep, copy.leaveConfirm])

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

  const fetchDynamicOptions = useCallback(
    async (field: InsuranceField, dependentValue: string) => {
      if (!field.dynamicOptions) return
      try {
        const response = await dynamicOptionsApi(field, dependentValue)
        const localized = localizeDynamicOptions(
          lang,
          field.dynamicOptions.dependsOn,
          dependentValue,
          response,
        )
        setDynamicOptions((prev) => ({
          ...prev,
          [field.id]: localized,
        }))
      } catch (err) {
        console.error(`Error fetching options for ${field.id}:`, err)
        toast.error(copy.optionsLoadError, {
          description: copy.optionsLoadErrorBody.replace("{field}", field.label),
        })
      }
    },
    [copy.optionsLoadError, copy.optionsLoadErrorBody, lang],
  )

  const watchedAll = form.watch()

  useEffect(() => {
    if (!formData) return
    const dynamics = collectDynamicFields(formData.fields)

    dynamics.forEach(({ field, path, dependsPath }) => {
      const dependentValue = dependsPath.split(".").reduce<unknown>((acc, key) => {
        if (acc && typeof acc === "object" && !Array.isArray(acc)) {
          return (acc as Record<string, unknown>)[key]
        }
        return undefined
      }, watchedAll)

      const asString = typeof dependentValue === "string" ? dependentValue : ""
      const prev = prevDependsRef.current[path]

      if (prev && prev !== asString) {
        form.setValue(path, "", { shouldDirty: true, shouldValidate: true })
      }
      prevDependsRef.current[path] = asString

      if (asString) {
        void fetchDynamicOptions(field, asString)
      } else {
        setDynamicOptions((prevOpts) => ({ ...prevOpts, [field.id]: [] }))
      }
    })
  }, [watchedAll, formData, fetchDynamicOptions, form])

  const onSubmit = (values: FormValues) => {
    if (!agreed) {
      toast.error(copy.agreeRequired)
      return
    }

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
          setAgreed(false)
          setSectionIndex(0)
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
    setAgreed(false)
    setFlowStep("review")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goNextSection = async () => {
    const section = sections[sectionIndex]
    if (!section) return
    const paths = getSectionPaths(section)
    const valid = await form.trigger(paths as never)
    if (!valid) {
      toast.error(copy.requiredHint)
      return
    }
    toast.success(copy.sectionReady, { duration: 1600 })
    if (sectionIndex >= sections.length - 1) {
      await goToReview()
      return
    }
    setSectionIndex((i) => i + 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goPrevSection = () => {
    if (sectionIndex <= 0) return
    setSectionIndex((i) => i - 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleManualSave = () => {
    saveDraft()
    toast.success(copy.draftSavedTitle, {
      description: copy.draftSavedBody,
      duration: 3000,
    })
  }

  const fillDemo = async () => {
    const preset = getDemoPreset(formId, lang)
    if (!preset) return
    form.reset(preset)
    // Load dependent options after preset (city/model)
    await new Promise((r) => setTimeout(r, 50))
    saveDraft()
    setSectionIndex(0)
    setFlowStep("details")
    toast.success(copy.fillDemoDone, { description: copy.fillDemoBody, duration: 3500 })
  }

  const journeyIndex = flowStep === "details" ? 0 : 1
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
        <span className="sr-only">{copy.loadingForm}</span>
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
          {copy.retry}
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

  const watched = watchedAll
  const filledCount = Object.values(watched).filter(
    (v) => v !== undefined && v !== null && v !== "",
  ).length
  const totalFields = formData.fields.reduce(
    (acc, field) => acc + (field.type === "group" && field.fields ? field.fields.length : 1),
    0,
  )
  const progressPct = totalFields ? Math.min(100, (filledCount / totalFields) * 100) : 0
  const reviewRows = buildReviewRows(formData.fields, watched, {
    yes: copy.yes,
    no: copy.no,
    locale: lang === "fa" ? "fa-IR" : "en-US",
  })
  const quote = estimateMonthlyPremium(formId, watched)
  const quoteLabel = formatQuote(quote, lang)
  const currentSection = sections[sectionIndex]
  const sectionLabel = copy.sectionOf
    .replace("{current}", String(sectionIndex + 1))
    .replace("{total}", String(Math.max(sections.length, 1)))
  const isLastSection = sectionIndex >= sections.length - 1

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
        <ApplicationStepper steps={steps} currentIndex={journeyIndex} />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              flowStep === "details" &&
              (e.target as HTMLElement).tagName !== "TEXTAREA"
            ) {
              e.preventDefault()
            }
          }}
        >
          {flowStep === "details" ? (
            <div className="grid gap-8 lg:grid-cols-[1.45fr_0.85fr]">
              <div className="space-y-6">
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary">
                      {sectionLabel}
                    </p>
                    <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
                      {currentSection?.label}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {copy.progress}: {Math.min(filledCount, totalFields)} / {totalFields}{" "}
                      {copy.fieldsStarted}
                    </p>
                    <div
                      className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted"
                      aria-hidden
                    >
                      <motion.div
                        className="h-full bg-primary"
                        initial={false}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {lastSaved ? (
                      <span className="text-xs text-muted-foreground">
                        {copy.lastSaved}:{" "}
                        {format(lastSaved, lang === "fa" ? "HH:mm" : "h:mm a", {
                          locale: lang === "fa" ? faIR : undefined,
                        })}
                      </span>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fillDemo}
                      className="gap-1.5"
                    >
                      <Wand2 className="h-4 w-4" aria-hidden />
                      {copy.fillDemo}
                    </Button>
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

                {/* Section pills */}
                <div className="flex flex-wrap gap-2" role="tablist" aria-label={copy.stepDetails}>
                  {sections.map((section, index) => {
                    const active = index === sectionIndex
                    const done = index < sectionIndex
                    return (
                      <button
                        key={section.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => {
                          if (index <= sectionIndex) setSectionIndex(index)
                        }}
                        className={[
                          "border px-3 py-1.5 text-xs font-semibold transition",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : done
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border text-muted-foreground",
                        ].join(" ")}
                      >
                        {index + 1}. {section.label}
                      </button>
                    )
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSection?.id ?? sectionIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    {currentSection?.fields.map((field) =>
                      renderFormField(field, "", form.control, form.watch, dynamicOptions, {
                        selectPlaceholder: copy.selectPlaceholder,
                        selectDepends: copy.selectDepends,
                        loadingOptions: copy.loadingOptions,
                        noOptions: copy.noOptions,
                        pickDate: copy.pickDate,
                        dateLocale: lang,
                      }),
                    )}
                  </motion.div>
                </AnimatePresence>

                <p className="text-xs text-muted-foreground">
                  {isLastSection ? copy.almostThere : lastSaved ? copy.autosave : copy.secureNote}
                </p>

                <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap gap-3 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
                  {sectionIndex > 0 ? (
                    <Button type="button" variant="outline" onClick={goPrevSection} className="gap-2">
                      <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
                      {copy.prevSection}
                    </Button>
                  ) : (
                    <Button asChild variant="outline" type="button">
                      <Link href={`/${lang}/`}>{copy.cancel}</Link>
                    </Button>
                  )}
                  <Button type="button" onClick={goNextSection} className="gap-2">
                    {isLastSection ? copy.continueReview : copy.nextSection}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                  </Button>
                </div>
              </div>

              <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                <div className="border border-primary/25 bg-primary/5 p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-4 w-4" aria-hidden />
                    <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                      {copy.liveQuote}
                    </p>
                  </div>
                  {filledCount === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">{copy.liveQuoteEmpty}</p>
                  ) : (
                    <>
                      <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight">
                        {quoteLabel}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {copy.reserveQuoteHint}
                      </p>
                    </>
                  )}
                </div>
                <ApplicationTips formId={formId} lang={lang} heading={copy.tipsHeading} />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
                  {copy.reviewTitle}
                </h2>
                <p className="text-sm text-muted-foreground">{copy.reviewSubtitle}</p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]"
              >
                <div className="border border-border bg-background/60">
                  {reviewRows.length === 0 ? (
                    <p className="p-6 text-sm text-muted-foreground">{copy.reviewEmpty}</p>
                  ) : (
                    <dl className="divide-y divide-border">
                      {reviewRows.map((row) => (
                        <div
                          key={row.path}
                          className="grid gap-1 px-5 py-4 sm:grid-cols-[minmax(9rem,12rem)_1fr] sm:gap-6"
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

                <aside className="flex flex-col gap-4 border border-primary/25 bg-primary/5 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      {copy.reserveQuote}
                    </p>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight">
                      {quoteLabel}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {copy.reserveQuoteHint}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <p>{copy.secureNote}</p>
                  </div>
                </aside>
              </motion.div>

              <label className="flex cursor-pointer items-start gap-3 border border-border bg-card/40 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-primary"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>{copy.agreeLabel}</span>
              </label>

              <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap gap-3 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
                <Button type="submit" disabled={isSubmitingForm || !agreed} className="gap-2">
                  {isSubmitingForm ? copy.submitting : copy.submit}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFlowStep("details")
                    setSectionIndex(Math.max(sections.length - 1, 0))
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
