"use client"

import Link from "next/link"
import type React from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Save } from "lucide-react"
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

interface IDynamicFormProps {
  formId: string
  lang: string
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

const DynamicForm: React.FC<IDynamicFormProps> = ({ formId, lang }) => {
  const { push } = useRouter()
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

        toast("Draft Restored", {
          description: "Your previous progress has been restored.",
          duration: 3000,
        })

        const savedAt = parsedDraft._lastSaved
        setLastSaved(new Date(typeof savedAt === "string" ? savedAt : Date.now()))
      }
    } catch (err) {
      console.error("Error loading draft:", err)
    }
  }, [formData, formId, form, formSchema])

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
      { data: values },
      {
        onSuccess: (result) => {
          const applicationId =
            (result as { data?: { applicationId?: string } })?.data?.applicationId ||
            `APP-${Date.now().toString(36).toUpperCase()}`

          toast.success("Application submitted", {
            description: "Your form has been successfully submitted.",
            duration: 4000,
          })
          clearDraft()
          form.reset()
          push(`/${lang}/insurance/${formId}/confirmation?ref=${encodeURIComponent(applicationId)}`)
        },
        onError: () => {
          toast.error("Submit failed", {
            description: "Something went wrong while sending your application. Please try again.",
          })
        },
      },
    )
  }

  const handleManualSave = () => {
    saveDraft()
    toast.success("Draft Saved", {
      description: "Your progress has been saved.",
      duration: 3000,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse" role="status" aria-live="polite">
        <div className="h-8 w-1/2 rounded bg-muted" />
        <div className="h-12 w-full rounded bg-muted" />
        <div className="h-12 w-full rounded bg-muted" />
        <div className="h-12 w-3/4 rounded bg-muted" />
        <span className="sr-only">Loading form…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3" role="alert">
        <p className="font-medium">Could not load this form</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Please check your connection and try again."}
        </p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="rounded-lg border p-6 text-center text-muted-foreground" role="status">
        Form not found.
      </div>
    )
  }

  const filledCount = Object.values(form.watch()).filter(
    (v) => v !== undefined && v !== null && v !== "",
  ).length
  const totalFields = formData.fields.reduce(
    (acc, field) => acc + (field.type === "group" && field.fields ? field.fields.length : 1),
    0,
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">{formData.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Progress: {Math.min(filledCount, totalFields)} / {totalFields} fields started
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <div className="text-sm text-muted-foreground">
                Last saved: {format(lastSaved, "h:mm a")}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving}
              className="flex items-center gap-1 cursor-pointer"
              aria-label="Save draft"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${totalFields ? Math.min(100, (filledCount / totalFields) * 100) : 0}%` }}
          />
        </div>

        <div className="space-y-6">
          {formData.fields.map((field) =>
            renderFormField(field, "", form.control, form.watch, dynamicOptions),
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          {lastSaved ? "Your progress is automatically saved every 30 seconds." : ""}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button className="cursor-pointer" type="submit" disabled={isSubmitingForm}>
            {isSubmitingForm ? "Submitting…" : "Submit application"}
          </Button>
          <Link href={`/${lang}/`}>
            <Button className="cursor-pointer" variant="outline" type="button">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </Form>
  )
}

export default DynamicForm
