"use client"

import { useState } from "react"
import { format } from "date-fns"
import { faIR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InsuranceField } from "@/types/insurance"
import { Calendar } from "@/components/ui/calendar"
import { Control, FieldValues } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FormControl, FormField as UIFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface IDateFieldProps {
  fieldPath: string
  control: Control<FieldValues>
  field: InsuranceField
  pickDate?: string
  dateLocale?: string
}

export const DateField: React.FC<IDateFieldProps> = ({
  fieldPath,
  control,
  field,
  pickDate,
  dateLocale,
}) => {
  const [open, setOpen] = useState(false)
  const isFa = dateLocale === "fa"

  return (
    <UIFormField
      key={fieldPath}
      control={control}
      name={fieldPath}
      render={({ field: formField }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{field.label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "h-11 w-full rounded-none pl-3 text-left font-normal",
                    !formField.value && "text-muted-foreground"
                  )}
                  aria-haspopup="dialog"
                  aria-expanded={open}
                >
                  {formField.value ? (
                    format(formField.value, "PPP", {
                      locale: isFa ? faIR : undefined,
                    })
                  ) : (
                    <span>{pickDate ?? "Pick a date"}</span>
                  )}
                  <CalendarIcon className="ms-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formField.value}
                onSelect={(date) => {
                  formField.onChange(date)
                  setOpen(false)
                }}
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
}
