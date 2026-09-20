import { InsuranceField } from "@/types/insurance";
import { Control, FieldValues, UseFormWatch } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormField as UIFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ISelectFieldProps {
  fieldPath: string;
  control: Control<FieldValues>,
  watch: UseFormWatch<FieldValues>,
  field: InsuranceField;
  dynamicOptions: Record<string, string[]>
  placeholders?: {
    selectPlaceholder?: string
    selectDepends?: string
    loadingOptions?: string
    noOptions?: string
  }
}

export const SelectField: React.FC<ISelectFieldProps> = ({ fieldPath, control, field, dynamicOptions, watch, placeholders }) => {
  const options = field.dynamicOptions ? dynamicOptions[field.id] || [] : field.options || []
  const dependsOn = field.dynamicOptions?.dependsOn
  const parentPath = fieldPath.includes(".")
    ? fieldPath.split(".").slice(0, -1).join(".")
    : ""
  const dependsOnPath = dependsOn
    ? parentPath
      ? `${parentPath}.${dependsOn}`
      : dependsOn
    : ""
  const dependentValue = dependsOnPath ? watch(dependsOnPath) : null
  const isDisabled = Boolean(dependsOn) && !dependentValue
  const selectAnOption = placeholders?.selectPlaceholder ?? ""
  const selectDepends =
    placeholders?.selectDepends?.replace("{field}", dependsOn || "") ?? ""

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
            value={
              formField.value !== undefined &&
              formField.value !== null &&
              formField.value !== ""
                ? String(formField.value)
                : undefined
            }
            disabled={isDisabled}
          >
            <FormControl>
              <SelectTrigger className="min-w-full h-11 rounded-none" aria-disabled={isDisabled}>
                <SelectValue
                  placeholder={
                    isDisabled
                      ? selectDepends
                      : selectAnOption
                  }
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.length === 0 && dependsOn && dependentValue ? (
                <div className="p-2 text-center text-muted-foreground">
                  {placeholders?.loadingOptions ?? ""}
                </div>
              ) : options.length === 0 ? (
                <div className="p-2 text-center text-muted-foreground">
                  {placeholders?.noOptions ?? ""}
                </div>
              ) : (
                options.map((option: string) => (
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
