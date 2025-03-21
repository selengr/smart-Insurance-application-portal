import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';
import { useForm } from 'react-hook-form';

import { IInputLabelProps } from './form.types';

const InputLabel = React.forwardRef<
  HTMLLabelElement,
  PropsWithChildren<IInputLabelProps>
>(({ className, children, name, ...props }, ref) => {
  const {
    formState: { errors },
  } = useForm();
  const hasError = !!errors[name!];

  return (
    <label
      ref={ref}
      className={classNames(
        'text-primary-text text-d-body2 md:text-d-body1',
        hasError && 'text-error',
        className
      )}
      htmlFor={name}
      {...props}
    >
      {children}
    </label>
  );
});

InputLabel.displayName = 'InputLabel';

export default InputLabel;
