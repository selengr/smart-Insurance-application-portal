import { InsuranceField } from "@/types/insurance";
import { Control, FieldValues, UseFormWatch } from "react-hook-form";
import { InputField, DateField, SelectField, RadioField, CheckboxField } from "../../components/fields";


// ------------------------------------------------------------------------------------
const isFieldVisible = (
  field: InsuranceField,
  parentPath: string,
  watch: UseFormWatch<FieldValues>
): boolean => {
  if (!field.visibility) return true;

  const { dependsOn, condition, value } = field.visibility;
  const dependsOnField = parentPath ? `${parentPath}.${dependsOn}` : dependsOn;
  const dependentValue = watch(dependsOnField);

  if (dependentValue === undefined) return false;

  switch (condition) {
    case "equals":
      return dependentValue === value;
    case "notEquals":
      return dependentValue !== value;
    default:
      return true;
  }
};
// ------------------------------------------------------------------------------------

export const renderFormField = (
  field: InsuranceField,
  parentPath: string = "",
  control: Control<FieldValues>,
  watch: UseFormWatch<FieldValues>,
  dynamicOptions: Record<string, string[]>
) => {
  const fieldPath = parentPath ? `${parentPath}.${field.id}` : field.id;

  if (!isFieldVisible(field, parentPath, watch)) {
    return null;
  }

  const commonProps = {
    fieldPath,
    control,
    field,
  };

  switch (field.type) {
    case "text":
      return <InputField key={field.id} {...commonProps} />;

    case "date":
      return <DateField key={field.id} {...commonProps} />;

    case "number":
      return <InputField key={field.id} {...commonProps} type="number" />;

    case "select":
      return <SelectField key={field.id} {...commonProps} watch={watch} dynamicOptions={dynamicOptions} />;

    case "radio":
      return <RadioField key={field.id} {...commonProps} />;

    case "checkbox":
      return <CheckboxField key={field.id} {...commonProps} />;

    case "group":
      return (
        <fieldset
          key={fieldPath}
          className="space-y-4 border border-border/80 bg-card/40 p-5 sm:p-6"
        >
          <legend className="px-1 font-[family-name:var(--font-display)] text-base font-bold tracking-tight">
            {field.label}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {field.fields?.map((subField) => (
              <div
                key={subField.id}
                className={
                  subField.type === "radio" || subField.type === "checkbox"
                    ? "sm:col-span-2"
                    : undefined
                }
              >
                {renderFormField(subField, fieldPath, control, watch, dynamicOptions)}
              </div>
            ))}
          </div>
        </fieldset>
      );

    default:
      return null;
  }
};