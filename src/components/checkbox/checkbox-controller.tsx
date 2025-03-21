import { Control, Controller, get, RegisterOptions } from 'react-hook-form';

import { Checkbox } from './checkbox';
import { TCheckboxProps } from './checkbox.types';

interface ICheckboxControllerProps
  extends Omit<TCheckboxProps, 'value' | 'onChange'> {
  control: Control<any>;
  rules?: RegisterOptions;
  name: string;
}

const CheckboxController: React.FC<ICheckboxControllerProps> = ({
  control,
  label,
  name,
  rules,
  ...props
}) => {
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field: { value, onChange }, formState: { errors } }) => (
        <Checkbox
          {...props}
          label={label}
          onChange={onChange}
          hasError={get(errors, name)}
          errorText={get(errors, name)?.message}
          value={value}
        />
      )}
    />
  );
};

export default CheckboxController;
