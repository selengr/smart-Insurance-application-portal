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
        <div key={fieldPath} className="space-y-4 border p-4 rounded-md">
          <h3 className="text-lg font-medium">{field.label}</h3>
          <div className="space-y-4">
            {field.fields?.map((subField) =>
              renderFormField(subField, fieldPath, control, watch, dynamicOptions)
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
};