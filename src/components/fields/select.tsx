import { InsuranceField } from "@/types/insurance";
import { Control, FieldValues, UseFormWatch } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormField as UIFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ISelectFieldProps {
  fieldPath: string;
  control: Control<FieldValues>,
  watch: UseFormWatch<FieldValues>,
  field: InsuranceField;
  dynamicOptions :any
}

// ------------------------------------------------------------------------------------
export const SelectField: React.FC<ISelectFieldProps> = ({ fieldPath, control, field,dynamicOptions ,watch}) => {
    const options = field.dynamicOptions ? dynamicOptions[field.id] || [] : field.options || []
    //-------------  Check if this field depends on another field
    const isDependentField = field.dynamicOptions?.dependsOn
    const dependentValue = isDependentField ? watch(field.dynamicOptions?.dependsOn || "") : null
    const isDisabled = isDependentField && !dependentValue
    
    return (
      <UIFormField
        key={fieldPath}
        control={control}
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
                  options.map((option :any) => (
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
};