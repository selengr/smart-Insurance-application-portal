'use client';

import React, { useState, createContext, forwardRef } from 'react';

type TRadioGroupContext = {
  selectedValue: string | null; // مقدار انتخاب‌شده
  onChange: (value: string) => void; // تابع تغییر مقدار
};

export const RadioGroupContext = createContext<TRadioGroupContext | undefined>(
  undefined
);

type RadioGroupProps = {
  name: string; // نام گروه رادیو
  defaultValue?: string; // مقدار پیش‌فرض
  onChange?: (value: string) => void; // تابع تغییر مقدار
  children: React.ReactNode; // فرزندان کامپوننت
  className?: string; // کلاس سفارشی برای ردیف
};

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ name, defaultValue = null, onChange, children, className }, ref) => {
    const [selectedValue, setSelectedValue] = useState<string | null>(
      defaultValue
    );

    const handleChange = (value: string) => {
      setSelectedValue(value);
      if (onChange) {
        onChange(value); // ارسال مقدار انتخاب‌شده به والد
      }
    };

    return (
      <RadioGroupContext.Provider
        value={{
          selectedValue,
          onChange: handleChange,
        }}
      >
        <div
          ref={ref}
          role="radiogroup"
          aria-labelledby={name}
          className={className}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
