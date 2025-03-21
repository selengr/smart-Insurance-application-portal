export type TRadioButtonProps = {
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
