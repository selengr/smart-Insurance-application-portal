import { InsuranceField } from "@/types/insurance";
import { InputField, DateField, SelectField, RadioField, CheckboxField } from "./fields";
import { Control, FieldValues, UseFormWatch } from "react-hook-form";

// Helper function to determine if a field should be visible
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

// Function to render form fields dynamically
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
    key: field.id,
    fieldPath,
    control,
    field,
  };

  switch (field.type) {
    case "text":
      return <InputField {...commonProps} />;

    case "date":
      return <DateField {...commonProps} />;

    case "number":
      return <InputField {...commonProps} type="number" />;

    case "select":
      return <SelectField {...commonProps} watch={watch} dynamicOptions={dynamicOptions} />;

    case "radio":
      return <RadioField {...commonProps} />;

    case "checkbox":
      return <CheckboxField {...commonProps} />;

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