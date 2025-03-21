// @typescript-eslint/no-unused-vars
'use client';

import classNames from 'classnames';
import Select, { GroupBase, StylesConfig } from 'react-select';

import {
  IOption,
  ISelectBoxProps,
} from './select-box.types';

export type TErrorBehaviour = {
  hasError?: boolean;
  errorText?: string;
};

import { HelperText } from '../helper-text';

export const SelectBox: React.FC<ISelectBoxProps & TErrorBehaviour> = ({
  label,
  customStyles,
  components,
  hasError,
  errorText,
  options,
  isDisabled,
  helperText,
  ...props
}) => {
  const mergedStyles: StylesConfig<IOption, boolean, GroupBase<IOption>> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: state.isDisabled ? 'var(--color)' : 'var(--color)',
      boxShadow: state.isFocused ? 'var(--shadow-input-focused)' : '',
      '&:hover': {
        boxShadow: 'var(--shadow-input-focused)',
      },
      borderColor: state.isDisabled
        ? 'var(--color-gray-300)'
        : hasError
          ? 'var(--color-error)'
          : state.isFocused
            ? 'var(--color-info-darker)'
            : 'var(--color-gray-400)',
      borderRadius: '8px',
      height: '46px',
      ...(customStyles?.control ? customStyles.control(provided, state) : {}),
    }),
    placeholder: (provided, state) => ({
      ...provided,
      color: 'var(--color-gray-500)',
      fontSize: 14,
      ...(customStyles?.placeholder
        ? customStyles.placeholder(provided, state)
        : {}),
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'rgba(0, 167, 111, 0.18)' // رنگ برای حالت انتخاب‌شده
        : state.isFocused
          ? 'rgba(0, 184, 217, 0.06)' // رنگ برای حالت فوکوس
          : '', // رنگ پیش‌فرض
      color: 'var(--color-primary-text)',
      fontWeight: state.isSelected ? '600' : '400',
      ':active': {
        backgroundColor: 'var(--color-inherit)',
      },
    }),
    menu: (provided) => ({
      ...provided,
      boxShadow: 'var(--shadow-z16)',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'var(--color-gray-600)',
    }),
    // سایر استایل‌ها...
    ...customStyles,
  };

  const mergedComponents = {
    IndicatorSeparator: () => null, // کامپوننت پیش‌فرض
    ...components, // کامپوننت‌های ارسال‌شده از بیرون
  };

  return (
    <>
      {label && (
        <label className="mb-1.5 block text-d-body1 font-normal text-primary-text">
          {label}
        </label>
      )}
      <Select
        isRtl
        styles={mergedStyles}
        components={mergedComponents}
        classNamePrefix="react-select"
        placeholder={props?.placeholder}
        className={classNames(
          'disabled:bg-gray-100',
          { 'border-error rounded-xl': hasError },
          {
            'input-disabled pointer-events-none cursor-not-allowed': isDisabled,
          }
        )}
        loadingMessage={() => <span>درحال دریافت اطلاعات</span>}
        noOptionsMessage={() => <span>اطلاعاتی یافت نشد!</span>}
        options={options}
        {...props}
      />

      {hasError && (
        <HelperText
          status={'error'}
          text={errorText!}
        />
      )}

      {helperText && (
        <HelperText
          status={'active'}
          text={helperText!}
        />
      )}
    </>
  );
};
