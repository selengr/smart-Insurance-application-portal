import { Input } from "@/components/ui/input";
import { InsuranceField } from "@/types/insurance";
import { Control, FieldValues } from "react-hook-form";
import { FormControl, FormField as UIFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface IInputFieldProps {
  fieldPath: string;
  control: Control<FieldValues>,
  field: InsuranceField;
  type? : "string" | "number"
 
}

// ------------------------------------------------------------------------------------
export const InputField: React.FC<IInputFieldProps> = ({ fieldPath, control, field, type = "string" }) => {
  
    return (
        <UIFormField
          key={fieldPath}
          control={control}
          name={fieldPath}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                 {type === "number" ? (
                        <Input
                        type="number"
                        {...formField}
                        value={formField.value || ""}
                        onChange={(e) => formField.onChange(Number(e.target.value))}
                        />
                 ) : (
                     <Input {...formField} value={formField.value || ""} />
                 )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )
  
};