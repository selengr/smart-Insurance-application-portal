import { FormControl, FormField as UIFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import classNames from "classnames";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Control, FieldValues } from "react-hook-form";
import { InsuranceField } from "@/types/insurance";
import { Input } from "@/components/input";

interface IRadioFieldProps {
  fieldPath: string;
  control: Control<FieldValues>,
  field: InsuranceField;
}

export const RadioField: React.FC<IRadioFieldProps> = ({ fieldPath, control, field }) => {
  
    return (
        <UIFormField
            key={fieldPath}
            control={control}
            name={fieldPath}
            render={({ field: formField }) => (
              <FormItem className="space-y-3">
                <FormLabel>{field?.label}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={formField.onChange}
                    value={formField.value || ""} // FIXED: Use value instead of defaultValue
                    className="flex flex-col space-y-1"
                  >
                    {field?.options?.map((option) => (
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
  
};