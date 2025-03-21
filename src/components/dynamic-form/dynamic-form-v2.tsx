"use client"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField as UIFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import classNames from "classnames"
import { CalendarIcon, Save } from "lucide-react"
import { toast } from "sonner"

const BASE_URL = "https://assignment.devotel.io"

// Define interfaces for the form structure
interface FormField {
  id: string
  type: string
  label?: string
  required?: boolean
  options?: string[]
  fields?: FormField[]
  visibility?: {
    dependsOn: string
    condition: string
    value: string
  }
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  dynamicOptions?: {
    dependsOn: string
    endpoint: string
    method: string
  }
}

interface FormData {
  formId: string
  title: string
  fields: FormField[]
}

interface DynamicFormProps {
  formId: string
}

const DynamicForm: React.FC<DynamicFormProps> = ({ formId }) => {
  const [formData, setFormData] = useState<FormData | null>(null)
  const [formSchema, setFormSchema] = useState<z.ZodTypeAny | null>(null)
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  // const [isLoadingOptionsMap, setIsLoadingOptionsMap] = useState<Record<string, boolean>>({})

  // Function to generate dynamic Zod schema based on form fields
  const generateZodSchema = (fields: FormField[]): z.ZodTypeAny => {
    const schemaMap: Record<string, z.ZodTypeAny> = {}

    const processFields = (fieldList: FormField[], parentId = "") => {
      fieldList.forEach((field) => {
        const fieldId = parentId ? `${parentId}.${field.id}` : field.id

        if (field.type === "group" && field.fields) {
          // For group fields, create a nested object schema
          const nestedSchema: Record<string, z.ZodTypeAny> = {}

          field.fields.forEach((subField) => {
            const subFieldSchema = createFieldSchema(subField)
            if (subFieldSchema) {
              nestedSchema[subField.id] = subFieldSchema
            }
          })

          schemaMap[field.id] = z.object(nestedSchema)
        } else {
          const fieldSchema = createFieldSchema(field)
          if (fieldSchema) {
            schemaMap[field.id] = fieldSchema
          }
        }
      })
    }

    const createFieldSchema = (field: FormField): z.ZodTypeAny | null => {
      let schema: z.ZodTypeAny

      switch (field.type) {
        case "text":
          schema = z.string()
          if (field.validation?.pattern) {
            schema = schema.regex(new RegExp(field.validation.pattern))
          }
          break

        case "number":
          schema = z.number()
          if (field.validation?.min !== undefined) {
            schema = schema.min(field.validation.min)
          }
          if (field.validation?.max !== undefined) {
            schema = schema.max(field.validation.max)
          }
          break

        case "date":
          schema = z.date()
          break

        case "select":
          schema = z.string()
          break

        case "radio":
          if (field.options) {
            schema = z.enum(field.options as [string, ...string[]])
          } else {
            schema = z.string()
          }
          break

        case "checkbox":
          if (field.options) {
            schema = z.array(z.string()).min(1)
          } else {
            schema = z.boolean()
          }
          break

        case "group":
          // Group fields are handled separately
          return null

        default:
          schema = z.string()
      }

      // Handle required fields
      if (!field.required) {
        schema = schema.optional()
      }

      return schema
    }

    processFields(fields)
    return z.object(schemaMap)
  }

  useEffect(() => {
    const fetchForm = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get<FormData[]>(`${BASE_URL}/api/insurance/forms`)
        const form = response.data.find((f) => f.formId === formId)

        if (form) {
          setFormData(form)
          const schema = generateZodSchema(form.fields)
          setFormSchema(schema)
        }
      } catch (error) {
        console.error("Error fetching form:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchForm()
  }, [formId])

  // Initialize form with dynamic schema
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
  }, [formData, formSchema, formId, form])

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

  // Update the fetchDynamicOptions function to be triggered when the dependent field changes
  const fetchDynamicOptions = async (field: FormField, dependentValue: string) => {
    if (!field.dynamicOptions) return

    try {
      console.log(`Fetching options for ${field.id} with ${field.dynamicOptions.dependsOn}=${dependentValue}`)
      const response = await axios({
        method: field.dynamicOptions.method,
        url: `${BASE_URL}${field.dynamicOptions.endpoint}`,
        params: { [field.dynamicOptions.dependsOn]: dependentValue },
      })
      console.log("rtetsestse=======", response.data.states)
      setDynamicOptions((prev) => ({
        ...prev,
        [field.id]: response.data.states,
      }))
    } catch (error) {
      console.error(`Error fetching options for ${field.id}:`, error)
    }
  }

  // Add a useEffect to watch for changes in dependent fields
  useEffect(() => {
    if (!formData) return

    // Find fields with dynamic options
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
    if (formId === "home_insurance_application") {
      setTimeout(() => {
        form.setValue("address.country", "France")
      }, 5000)
    }
  }, [form.watch("address.country"), formData])

  console.log(form.watch("address.country"))
  // Check if a field should be visible based on dependencies
  const isFieldVisible = (field: FormField, parentPath: string): boolean => {
    if (!field.visibility) return true
    const { dependsOn, condition, value } = field.visibility
    const dependsOnField = parentPath ? `${parentPath}.${dependsOn}` : dependsOn
    // const dependentValue = form.watch("health_info.smoker")
    const dependentValue = form.watch(dependsOnField)

    if (!dependentValue) return false

    switch (condition) {
      case "equals":
        return dependentValue === value
      case "notEquals":
        return dependentValue !== value
      default:
        return true
    }
  }

  // Handle form submission
  const onSubmit = (values: any) => {
    console.log("Form submitted with values:", values)
    // Here you would typically send the data to your backend

    clearDraft()

    toast("Form Submitted", {
      description: "Your form has been successfully submitted.",
      duration: 5000,
    })
  }

  const handleManualSave = () => {
    saveDraft()
    toast("Draft Saved", {
      description: "Your progress has been saved.",
      duration: 3000,
    })
  }

  // Render a single form field based on its type
  const renderField = (field: FormField, parentPath = "") => {
    const fieldPath = parentPath ? `${parentPath}.${field.id}` : field.id

    // Check visibility conditions
    if (!isFieldVisible(field, parentPath)) {
      return null
    }

    switch (field.type) {
      case "text":
        return (
          <UIFormField
            key={fieldPath}
            control={form.control}
            name={fieldPath}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input {...formField} value={formField.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "date":
        return (
          <UIFormField
            key={fieldPath}
            control={form.control}
            name={fieldPath}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{field.label}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={classNames(
                          "w-full pl-3 text-left font-normal",
                          !formField.value && "text-muted-foreground",
                        )}
                      >
                        {formField.value ? format(formField.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formField.value}
                      onSelect={formField.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "number":
        return (
          <UIFormField
            key={fieldPath}
            control={form.control}
            name={fieldPath}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...formField}
                    value={formField.value || ""}
                    onChange={(e) => formField.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

        case "select":
          const options = field.dynamicOptions ? dynamicOptions[field.id] || [] : field.options || []
  
          // Check if this field depends on another field
          const isDependentField = field.dynamicOptions?.dependsOn
          const dependentValue = isDependentField ? form.watch(field.dynamicOptions?.dependsOn || "") : null
          const isDisabled = isDependentField && !dependentValue
  
          // FIXED: Changed defaultValue to value to ensure the select field shows the saved value
          return (
            <UIFormField
              key={fieldPath}
              control={form.control}
              name={fieldPath}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <Select
                    onValueChange={formField.onChange}
                    value={formField.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger className="min-w-full">
                        <SelectValue
                          placeholder={
                            isDisabled ? `Select a ${field.dynamicOptions?.dependsOn} first` : "Select an option"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {options.length === 0 && isDependentField && dependentValue ? (
                        <div className="p-2 text-center text-muted-foreground">Loading...</div>
                      ) : options.length === 0 ? (
                        <div className="p-2 text-center text-muted-foreground">No options available</div>
                      ) : (
                        options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )
  

      case "radio":
        // FIXED: Changed defaultValue to value to ensure the radio field shows the saved value
        return (
          <UIFormField
            key={fieldPath}
            control={form.control}
            name={fieldPath}
            render={({ field: formField }) => (
              <FormItem className="space-y-3">
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={formField.onChange}
                    value={formField.value || ""} // FIXED: Use value instead of defaultValue
                    className="flex flex-col space-y-1"
                  >
                    {field.options?.map((option) => (
                      <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal">{option}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "checkbox":
        if (field.options) {
          // FIXED: Initialize formField.value as an array if it's undefined
          return (
            <UIFormField
              key={fieldPath}
              control={form.control}
              name={fieldPath}
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>{field.label}</FormLabel>
                  </div>
                  {field.options?.map((option) => (
                    <UIFormField
                      key={option}
                      control={form.control}
                      name={fieldPath}
                      render={({ field: formField }) => {
                        const currentValue = formField.value || []
                        // Convert object-like array {0: 'value1', 1: 'value2'} to proper array ['value1', 'value2']
                        const valueArray = Array.isArray(currentValue) ? currentValue : Object.values(currentValue)
                        const isChecked = valueArray.includes(option)

                        return (
                          <FormItem key={option} className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                            <FormControl>
                            <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  // Ensure we're working with an array
                                  const valueArray = Array.isArray(currentValue)
                                    ? [...currentValue]
                                    : Object.values(currentValue)

                                  if (checked) {
                                    formField.onChange([...valueArray, option])
                                  } else {
                                    formField.onChange(valueArray.filter((value) => value !== option))
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{option}</FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        } else {
          // FIXED: Handle boolean checkbox value properly
          return (
            <UIFormField
              key={fieldPath}
              control={form.control}
              name={fieldPath}
              render={({ field: formField }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={!!formField.value} // FIXED: Convert to boolean with !!
                      onCheckedChange={formField.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{field.label}</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        }

      case "group":
        return (
          <div key={fieldPath} className="space-y-4 border p-4 rounded-md">
            <h3 className="text-lg font-medium">{field.label}</h3>
            <div className="space-y-4">{field.fields?.map((subField) => renderField(subField, fieldPath))}</div>
          </div>
        )

      default:
        return null
    }
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
        <div className="space-y-6">{formData.fields.map((field) => renderField(field))}</div>
        <div className="text-sm text-muted-foreground">
          {lastSaved ? "Your progress is automatically saved every 30 seconds." : ""}
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

export default DynamicForm

