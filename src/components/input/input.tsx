import classNames from 'classnames';
import { forwardRef } from 'react';


import { TInputProps } from './input.types';
import { HelperText } from '../helper-text';
import Textbox from '../textbox/textbox';

export const Input = forwardRef<HTMLInputElement, TInputProps>(
  (
    {
      className,
      disabled,
      hasError = false, // پیش‌فرض بدون خطا
      helperText = '', // پیام خطا
      direction = 'rtl', // مقدار پیش‌فرض برای direction
      errorText,
      ...rest
    },
    ref
  ) => {
    return (
      <div className="w-full">
        <div
          dir={direction}
          className={classNames(
            'input-wrapper inline-flex h-full w-full flex-1 rounded-lg',
            {
              'input-disabled': disabled,
              'rtl-direction': direction === 'rtl',
              'ltr-direction': direction === 'ltr',
              'border-error': hasError, // اضافه کردن کلاس border-error در صورت وجود خطا
              'border-gray-400': !hasError, // اضافه کردن کلاس border-error در صورت وجود خطا
            },
            className
          )}
        >
      
            <Textbox
              ref={ref} // انتقال ref به Textbox
              className={classNames('border-[1px]  w-full flex-1 shrink font-normal text-primary outline-none placeholder:text-sm placeholder:text-gray-500 md:placeholder:text-lg md:placeholder:text-gray-600 disabled:text-gray-500 disabled:placeholder:text-gray-600 px-3 py-2.5', {
                'input-disabled': disabled,
                'placeholder:text-right': rest?.type === 'number',
              })}
              disabled={disabled}
              {...rest}
            />

          </div>

       
        {hasError && (
          <HelperText
            status={'error'}
            text={errorText!}
          />
        )}
        {helperText && (
          <HelperText
            status={'active'}
            text={helperText}
          />
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
