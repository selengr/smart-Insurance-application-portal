import { FormControl, FormField as UIFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import classNames from "classnames";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { InsuranceField } from "@/types/insurance";
import { Control, FieldValues } from "react-hook-form";

interface IDateFieldProps {
  fieldPath: string;
  control: Control<FieldValues>,
  field: InsuranceField;
 
}

export const DateField: React.FC<IDateFieldProps> = ({ fieldPath, control, field }) => {
  return (
    <UIFormField
      key={fieldPath}
      control={control}
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
                    !formField.value && "text-muted-foreground"
                  )}
                  aria-haspopup="dialog"
                  aria-expanded={formField.value ? "true" : "false"}
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
  );
};