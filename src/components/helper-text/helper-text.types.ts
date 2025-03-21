export type THelperTextProps = {
  status?: 'active' | 'error' | 'success'; // وضعیت
  isDisabled?: boolean; // غیرفعال بودن
  text: string; // متن
  customClassName?: string; // کلاس سفارشی برای متن
};
