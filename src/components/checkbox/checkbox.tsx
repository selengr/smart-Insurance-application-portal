import classNames from 'classnames';
import Image from 'next/image';
import { HelperText } from '../helper-text';
import { TCheckboxProps } from './checkbox.types';

export const Checkbox: React.FC<TCheckboxProps> = ({
  label,
  onChange,
  value,
  customStyles = {},
  disabled,
  id,
  size = 'medium',
  hasError,
  errorText,
}) => {
  const labelClasses = classNames('checkbox-label', customStyles?.label, {
    'text-d-body2': size === 'medium',
    'text-m-body2': size === 'small',
    'text-primary-text': !disabled,
    'text-disabled': disabled,
  });

  const checkboxClasses = classNames(
    'checkbox-wrapper flex items-center gap-x-2',
    {
      'cursor-not-allowed': disabled,
    }
  );

  const checkboxBoxClasses = classNames(
    'checkbox-box group',
    value ? customStyles.box?.checked : customStyles.box?.unchecked,
    {
      'w-5 h-5': size === 'medium',
      'w-4 h-4': size === 'small',
      'bg-primary border-primary': value && !disabled,
      'border-secondary-text': !value && !disabled,
      'bg-disabled border-disabled': disabled && value,
      'border-disabled': disabled && !value,
    }
  );
  const handleChange = () => {
    if (!disabled && onChange) {
      const simulatedEvent = {
        target: {
          type: 'checkbox',
          checked: !value,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(simulatedEvent);
    }
  };

  return (
    <>
      <div className={checkboxClasses}>
        {/* Hidden Input for Accessibility */}
        <input
          id={id}
          type="checkbox"
          checked={value}
          onChange={() => {}} // No-op for hidden input
          disabled={disabled}
          hidden
        />

        {/* Custom Box and Label */}
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center gap-2"
          onClick={handleChange} // Handle clicks here
        >
          <div className={checkboxBoxClasses}>
            {Boolean(value) && (
              <Image
                src="/icons/check.svg"
                className="text-white"
                width="9"
                height="9"
                alt='check'
              />
            )}
          </div>
          <span className={labelClasses}>{label}</span>
        </label>
      </div>

      {hasError && (
        <HelperText
          status={'error'}
          text={errorText!}
        />
      )}
    </>
  );
};
