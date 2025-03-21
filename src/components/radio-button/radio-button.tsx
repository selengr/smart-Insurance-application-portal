'use client';

import classNames from 'classnames';
import { useContext, forwardRef } from 'react';

import { RadioGroupContext } from './radio-group';

type TRadioButtonProps = {
  label: string; // متن لیبل
  value: string; // مقدار رادیو
  size?: 'medium' | 'small'; // سایز دکمه رادیو
  disabled?: boolean; // غیرفعال بودن
  customStyles?: {
    // استایل‌های کاستوم
    circle?: {
      checked?: string; // استایل در حالت انتخاب‌شده
      unchecked?: string; // استایل در حالت انتخاب‌نشده
    };
    label?: string; // کلاس‌های کاستوم برای لیبل
    hoverEffect?: string; // کلاس‌های کاستوم برای افکت هاور
  };
};

export const RadioButton = forwardRef<HTMLInputElement, TRadioButtonProps>(
  (
    { label, value, size = 'medium', disabled = false, customStyles = {} },
    ref
  ) => {
    const context = useContext(RadioGroupContext);

    if (!context) {
      throw new Error('RadioButton must be used within a RadioGroup');
    }

    const { selectedValue, onChange } = context;

    const isChecked = selectedValue === value;

    const radioWrapperClasses = classNames(
      'radio-wrapper flex w-fit items-center  gap-x-2 group cursor-pointer',
      {
        'cursor-not-allowed': disabled, // غیرفعال
      }
    );

    const radioCircleClasses = classNames(
      'radio-circle group',
      isChecked ? customStyles.circle?.checked : customStyles.circle?.unchecked,
      {
        'w-5 h-5': size === 'medium',
        'w-4 h-4': size === 'small',
        'bg-white border-primary': isChecked && !disabled,
        'border-secondary-text': !isChecked && !disabled,
        'border-disabled ': disabled,
      }
    );

    const hoverEffectClasses = classNames(
      'radio-hover-effect',
      customStyles.hoverEffect,
      {
        'bg-primary bg-opacity-12': !disabled && isChecked,
        'bg-gray-500 bg-opacity-12': !disabled && !isChecked,
      }
    );

    const labelClasses = classNames('radio-label', customStyles.label, {
      'text-d-body2': size === 'medium',
      'text-m-body2': size === 'small',
      'text-primary-text': !disabled,
      'text-disabled cursor-not-allowed': disabled,
    });

    const handleRadioChange = () => {
      if (disabled) return;
      onChange(value); // مقدار جدید را به RadioGroup ارسال می‌کنیم
    };

    return (
      <label className={radioWrapperClasses}>
        {/* اینپوت هیدن */}
        <input
          ref={ref}
          type="radio"
          value={value}
          checked={isChecked}
          onChange={handleRadioChange}
          disabled={disabled}
          className="hidden"
        />

        {/* دایره رادیو */}
        <div className={radioCircleClasses}>
          {isChecked && (
            <div
              className={`h-3/4 w-3/4 rounded-full ${disabled ? 'bg-disabled' : 'bg-primary'}`}
            ></div>
          )}
          <div className={hoverEffectClasses}></div>
        </div>

        {/* لیبل */}
        <span className={labelClasses}>{label}</span>
      </label>
    );
  }
);

RadioButton.displayName = 'RadioButton';
