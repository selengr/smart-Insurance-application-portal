import { InsuranceField } from "@/types/insurance";
import { Checkbox } from "@/components/ui/checkbox";
import { Control, FieldValues } from "react-hook-form";
import { FormControl, FormField as UIFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ICheckboxFieldProps {
  fieldPath: string;
  control: Control<FieldValues>,
  field: InsuranceField;
}
// ------------------------------------------------------------------------------------
export const CheckboxField: React.FC<ICheckboxFieldProps> = ({ fieldPath, control, field}) => {
    if (field.options) {
    return (
        <UIFormField
              key={fieldPath}
              control={control}
              name={fieldPath}
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>{field.label}</FormLabel>
                  </div>
                  {field.options?.map((option) => (
                    <UIFormField
                      key={option}
                      control={control}
                      name={fieldPath}
                      render={({ field: formField }) => {
                        const currentValue = formField.value || []
                        const valueArray = Array.isArray(currentValue) ? currentValue : Object.values(currentValue)
                        const isChecked = valueArray.includes(option)

                        return (
                          <FormItem key={option} className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                            <FormControl>
                            <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
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

       ) } else {
            return (
              <UIFormField
                key={fieldPath}
                control={control}
                name={fieldPath}
                render={({ field: formField }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={!!formField.value} 
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
      
  
};