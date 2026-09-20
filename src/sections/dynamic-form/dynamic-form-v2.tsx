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
import type { z } from "zod"
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
  continueDraft: string
  startFresh: string
  draftFound: string
  discardCancel: string
  editSection: string
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
  discardDraft: string
  discardDraftDone: string
  discardDraftConfirm: string
}

interface IDynamicFormProps {
  formId: string
  lang: string
  copy: FormCopy
  productBlurb?: string
  formsCatalog?: FormsCatalog
}

type ReadyProps = {
  formId: string
  lang: string
  copy: FormCopy
  productBlurb?: string
  formData: ReturnType<typeof localizeInsuranceForm>
  formSchema: z.ZodTypeAny
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

const DynamicFormReady: React.FC<ReadyProps> = ({
  formId,
  lang,
  copy,
  productBlurb,
  formData,
  formSchema,
}) => {
  const { push } = useRouter()
  const [flowStep, setFlowStep] = useState<FlowStep>("details")
  const [sectionIndex, setSectionIndex] = useState(0)
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [pendingDraft, setPendingDraft] = useState<FormValues | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevDependsRef = useRef<Record<string, string>>({})
  const draftLoadedRef = useRef(false)

  const sections = useMemo(() => buildFormSections(formData.fields), [formData])

  const { mutate: submitForm, isPending: isSubmitingForm } = useSubmitForm()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
    if (draftLoadedRef.current) return
    draftLoadedRef.current = true

    try {
      const savedDraft = localStorage.getItem(`form_draft_${formId}`)
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft) as FormValues
        const processedDraft = processDraftDates(parsedDraft)
        setPendingDraft(processedDraft)
        const savedAt = parsedDraft._lastSaved
        setLastSaved(new Date(typeof savedAt === "string" ? savedAt : Date.now()))
      }
    } catch (err) {
      console.error("Error loading draft:", err)
    }
    // Mount-once draft restore for this form instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId])

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
        setDynamicOptions((prev) => {
          const existing = prev[field.id]
          if (
            existing &&
            existing.length === localized.length &&
            existing.every((value, index) => value === localized[index])
          ) {
            return prev
          }
          return { ...prev, [field.id]: localized }
        })
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

  const dependsKey = useMemo(() => {
    if (!formData) return ""
    return collectDynamicFields(formData.fields)
      .map(({ dependsPath }) => {
        const value = dependsPath.split(".").reduce<unknown>((acc, key) => {
          if (acc && typeof acc === "object" && !Array.isArray(acc)) {
            return (acc as Record<string, unknown>)[key]
          }
          return undefined
        }, watchedAll)
        return `${dependsPath}:${typeof value === "string" ? value : ""}`
      })
      .join("|")
  }, [formData, watchedAll])

  useEffect(() => {
    if (!formData) return
    const dynamics = collectDynamicFields(formData.fields)
    if (dynamics.length === 0) return

    dynamics.forEach(({ field, path, dependsPath }) => {
      const dependentValue = dependsPath.split(".").reduce<unknown>((acc, key) => {
        if (acc && typeof acc === "object" && !Array.isArray(acc)) {
          return (acc as Record<string, unknown>)[key]
        }
        return undefined
      }, form.getValues())

      const asString = typeof dependentValue === "string" ? dependentValue : ""
      const prev = prevDependsRef.current[path]

      if (prev !== undefined && prev !== asString) {
        form.setValue(path, undefined, { shouldDirty: true, shouldValidate: false })
      }
      prevDependsRef.current[path] = asString

      if (asString) {
        void fetchDynamicOptions(field, asString)
      } else {
        setDynamicOptions((prevOpts) => {
          if (!prevOpts[field.id]?.length) return prevOpts
          return { ...prevOpts, [field.id]: [] }
        })
      }
    })
    // dependsKey tracks parent select changes without looping on every watch object identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependsKey, formData, fetchDynamicOptions])

  const onSubmit = (values: FormValues) => {
    if (!agreed) {
      toast.error(copy.agreeRequired)
      return
    }

    const monthlyEstimate = estimateMonthlyPremium(formId, values)

    submitForm(
      { data: { ...values, formId, monthlyEstimate } },
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

  const discardDraft = () => {
    if (!confirmDiscard) {
      setConfirmDiscard(true)
      return
    }
    clearDraft()
    form.reset({})
    setSectionIndex(0)
    setFlowStep("details")
    setAgreed(false)
    setPendingDraft(null)
    setConfirmDiscard(false)
    toast.success(copy.discardDraftDone)
  }

  const continueDraft = () => {
    if (!pendingDraft) return
    form.reset(pendingDraft)
    setPendingDraft(null)
    toast.success(copy.draftRestoredTitle, {
      description: copy.draftRestoredBody,
      duration: 2800,
    })
  }

  const startFresh = () => {
    clearDraft()
    form.reset({})
    setPendingDraft(null)
    setLastSaved(null)
    setSectionIndex(0)
    setConfirmDiscard(false)
  }

  const fillDemo = async () => {
    const preset = getDemoPreset(formId, lang)
    if (!preset) return
    form.reset(preset)
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
  const reviewSections = sections
    .map((section, index) => ({
      section,
      index,
      rows: buildReviewRows(section.fields, watched, {
        yes: copy.yes,
        no: copy.no,
        locale: lang === "fa" ? "fa-IR" : "en-US",
      }),
    }))
    .filter((entry) => entry.rows.length > 0)
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
        <ApplicationStepper
          steps={steps}
          currentIndex={journeyIndex}
          onStepSelect={(index) => {
            if (index === 0 && flowStep === "review") {
              setFlowStep("details")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          }}
        />
      </div>

      {pendingDraft ? (
        <div
          className="mb-6 border border-primary/30 bg-primary/5 px-4 py-4 sm:px-5"
          role="region"
          aria-label={copy.draftFound}
        >
          <p className="text-sm font-semibold text-foreground">{copy.draftFound}</p>
          <p className="mt-1 text-sm text-muted-foreground">{copy.draftRestoredBody}</p>
          {lastSaved ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {copy.lastSaved}:{" "}
              {format(lastSaved, lang === "fa" ? "HH:mm" : "h:mm a", {
                locale: lang === "fa" ? faIR : undefined,
              })}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={continueDraft}>
              {copy.continueDraft}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={startFresh}>
              {copy.startFresh}
            </Button>
          </div>
        </div>
      ) : null}

      {confirmDiscard ? (
        <div className="mb-6 border border-border bg-card/70 px-4 py-4 sm:px-5" role="alertdialog">
          <p className="text-sm font-medium">{copy.discardDraftConfirm}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="destructive" onClick={discardDraft}>
              {copy.discardDraft}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setConfirmDiscard(false)}
            >
              {copy.discardCancel}
            </Button>
          </div>
        </div>
      ) : null}

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
                    {lastSaved ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={discardDraft}
                        className="gap-1.5 text-destructive hover:text-destructive"
                      >
                        {copy.discardDraft}
                      </Button>
                    ) : null}
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
                    <div className="divide-y divide-border">
                      {reviewSections.map(({ section, index, rows }) => (
                        <section key={section.id} className="px-5 py-5">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-[family-name:var(--font-display)] text-base font-bold">
                              {section.label}
                            </h3>
                            <button
                              type="button"
                              className="text-xs font-semibold text-primary hover:underline"
                              onClick={() => {
                                setFlowStep("details")
                                setSectionIndex(index)
                                window.scrollTo({ top: 0, behavior: "smooth" })
                              }}
                            >
                              {copy.editSection}
                            </button>
                          </div>
                          <dl className="divide-y divide-border/70 border border-border/70">
                            {rows.map((row) => (
                              <div
                                key={row.path}
                                className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(9rem,12rem)_1fr] sm:gap-6"
                              >
                                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                  {row.label}
                                </dt>
                                <dd className="text-sm font-medium text-foreground">{row.value}</dd>
                              </div>
                            ))}
                          </dl>
                        </section>
                      ))}
                    </div>
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

export default function DynamicForm({
  formId,
  lang,
  copy,
  productBlurb,
  formsCatalog,
}: IDynamicFormProps) {
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

  if (isLoading && !formData) {
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

  if (!formData || !formSchema) {
    return (
      <div className="border p-8 text-center text-muted-foreground" role="status">
        {copy.notFound}
      </div>
    )
  }

  return (
    <DynamicFormReady
      key={formId}
      formId={formId}
      lang={lang}
      copy={copy}
      productBlurb={productBlurb}
      formData={formData}
      formSchema={formSchema}
    />
  )
}
