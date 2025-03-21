import { ChangeEventHandler, InputHTMLAttributes } from 'react';

export type TCheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> & {
  label: string;
  value: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  customStyles?: {
    // استایل‌های کاستوم
    box?: {
      checked?: string; // استایل در حالت چک‌شده
      unchecked?: string; // استایل در حالت چک‌نشده
    };
    label?: string; // کلاس‌های کاستوم برای لیبل
    circleHover?: string; // کلاس‌های کاستوم برای دایره‌ی هاور
  };
  size?: 'medium' | 'small'; // سایز چک‌باکس
  disabled?: boolean; // غیرفعال بودن
  id?: string;
  hasError?: boolean;
  errorText?: string;
};
