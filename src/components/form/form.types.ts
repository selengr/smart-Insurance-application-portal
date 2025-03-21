/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { RegisterOptions, Control } from 'react-hook-form';

export interface IFormRowProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface IInputLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  name?: string;
  hasError?: boolean;
}

export interface IFormField {
  name: string;
  label: string;
  className?: string;
  placeholder?: string;
  // control: Control<any>;
}

export interface IFormFieldProps extends IFormField {
  direction?: 'ltr' | 'rtl';
  rules?: RegisterOptions;
  control: Control<any>;
}

export interface IDatePickerFieldProps extends IFormField {
  isPersian?: boolean;
}

export interface ISelectBoxFieldProps extends IFormField {
  rules?: RegisterOptions;
  options: any[];
}

export interface IFileUploaderFieldProps extends IFormField {
  rules?: RegisterOptions;
  uploadUrl: string;
  allowedFormats?: string[];
  setValue?: any;
}
