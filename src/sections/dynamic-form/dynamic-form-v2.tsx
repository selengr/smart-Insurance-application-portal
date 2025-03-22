"use client"
import Link from "next/link"
import type React from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Save } from "lucide-react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react"


import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { InsuranceField } from "@/types/insurance"
import { renderFormField } from "./render-form-field"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSubmitForm } from "@/hooks/use-submit-form"
import { dynamicOptionsApi } from "@/services/api/insurance-forms"
import { useFetchInsuranceForms } from "@/hooks/use-fetch-insurance-forms"

interface IDynamicFormProps {
  formId: string
  lang: string
}

const DynamicForm: React.FC<IDynamicFormProps> = ({ formId, lang }) => {
  const {push, refresh} = useRouter()
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({})

  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)


  const { data, isFetching : isLoading } = useFetchInsuranceForms(formId);
  const formData = data?.form || null;
  const formSchema = data?.schema || null;

  const {
    mutate: submitForm,
    isPending: isSubmitingForm,
  } = useSubmitForm();

  const form = useForm<any>({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    mode: "onBlur",
  })

  useEffect(() => {
    if (!formData || !formSchema) return

    try {
      const savedDraft = localStorage.getItem(`form_draft_${formId}`)
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft)
console.log("=========",parsedDraft)
        // Convert date strings back to Date objects
        const processedDraft = processDraftDates(parsedDraft)

        // Set the form values from the draft
        form.reset(processedDraft)

        // Show toast notification
        toast("Draft Restored", {
          description: "Your previous progress has been restored.",
          duration: 3000,
        })

        // Update last saved timestamp
        setLastSaved(new Date(parsedDraft._lastSaved || Date.now()))
      }
    } catch (error) {
      console.error("Error loading draft:", error)
    }
  }, [formId, form])
  // }, [formData, formSchema, formId, form])

  const processDraftDates = (draft: any): any => {
    if (!draft) return draft

    const result = { ...draft }
    delete result._lastSaved

    // Process each field to convert date strings to Date objects
    Object.keys(result).forEach((key) => {
      if (typeof result[key] === "object" && result[key] !== null) {
        result[key] = processDraftDates(result[key])
      } else if (typeof result[key] === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(result[key])) {
        // This looks like an ISO date string
        result[key] = new Date(result[key])
      }
    })

    return result
  }

  const saveDraft = useCallback(() => {
    if (!formData) return

    setIsSaving(true)

    // Get current form values
    const formValues = form.getValues()

    // Add timestamp
    const draftToSave = {
      ...formValues,
      _lastSaved: new Date().toISOString(),
    }

    // Save to localStorage
    localStorage.setItem(`form_draft_${formId}`, JSON.stringify(draftToSave))

    // Update last saved timestamp
    setLastSaved(new Date())

    setIsSaving(false)
  }, [form, formData, formId])

  useEffect(() => {
    if (!formData) return

    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current)
    }

    // Set up new timer to save every 30 seconds
    autoSaveTimerRef.current = setInterval(() => {
      saveDraft()
    }, 30000) // 30 seconds

    // Clean up timer on unmount
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
      const response = await dynamicOptionsApi(field,dependentValue)
      setDynamicOptions((prev) => ({
        ...prev,
        [field.id]: response
      }))
    } catch (error) {
      console.error(`Error fetching options for ${field.id}:`, error)
    }
  }

   //----------------- useEffect for watching changes in dependent fields
  useEffect(() => {
    if (!formData) return

    //----------------- this line is looking for fielding dynamic options
    const fieldsWithDynamicOptions = formData.fields.flatMap((field) =>
      field.type === "group" && field.fields
        ? field.fields.filter((f) => f.dynamicOptions)
        : field.dynamicOptions
          ? [field]
          : [],
    )

    // For each field with dynamic options, watch its dependency
    fieldsWithDynamicOptions.forEach((field) => {
      if (!field.dynamicOptions) return
      const dependentValue = form.watch(field.dynamicOptions.dependsOn)
      const dependentValue2 = form.watch("address.country")
      if (dependentValue2) {
        fetchDynamicOptions(field, dependentValue2)
      }
    })
    //----------------- this line is added hard code to prevent error due to country do not exist in health form api
    if (formId === "home_insurance_application") {
      setTimeout(() => {
        form.setValue("address.country", "France")
      }, 5000)
    }
  }, [form.watch("address.country"), formData])

 

  const onSubmit = (values: any) => {
    console.log("Form submitted with values:", values)
    
    submitForm(
      { data: values },
      {
        onSuccess: () => {
          toast("Form Submitted", {
            description: "Your form has been successfully submitted.",
            duration: 5000,
          })
          refresh()
          clearDraft()
          form.reset();
          setTimeout(() => {
            push(`/${lang}/purchased-insurances`)
          }, 200);
        },
        
      }
    );
  }

  const handleManualSave = () => {
    saveDraft()
    toast("Draft Saved", {
      description: "Your progress has been saved.",
      duration: 3000,
    })
  }



  if (isLoading) return <div>Loading form...</div>
  if (!formData) return <div>Form not found</div>

 

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{formData.title}</h2>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <div className="text-sm text-muted-foreground">Last saved: {format(lastSaved, "h:mm a")}</div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving}
              className="flex items-center gap-1 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
          </div>
        </div>
        <div className="space-y-6">{formData.fields.map((field) => renderFormField(field,"",form.control,form.watch,dynamicOptions))}</div>
        <div className="text-sm text-muted-foreground">
          {lastSaved ? "Your progress is automatically saved every 30 seconds." : ""}
        </div>
       <div className="flex gap-3">
         <Button className="cursor-pointer" type="submit">Submit</Button>
         <Link href={"/fa/"}><Button className="cursor-pointer" variant={"destructive"} type="submit">cansel</Button></Link>
       </div>
      </form>
    </Form>
  )
}

export default DynamicForm

