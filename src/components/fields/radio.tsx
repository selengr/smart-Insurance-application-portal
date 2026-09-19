import { InsuranceField } from "@/types/insurance";
import { Control, FieldValues } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FormControl, FormField as UIFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

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
              value={formField.value || ""}
              className="grid gap-2 sm:grid-cols-2"
            >
              {field?.options?.map((option) => {
                const selected = formField.value === option
                return (
                  <FormItem key={option} className="space-y-0">
                    <FormControl>
                      <label
                        className={[
                          "flex cursor-pointer items-center gap-3 border px-4 py-3 text-sm transition",
                          selected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border bg-background/50 hover:border-primary/40",
                        ].join(" ")}
                      >
                        <RadioGroupItem value={option} />
                        <span className="font-medium">{option}</span>
                      </label>
                    </FormControl>
                  </FormItem>
                )
              })}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
};
