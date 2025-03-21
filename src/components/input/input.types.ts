import { InputHTMLAttributes } from 'react';

type TTextboxProps = InputHTMLAttributes<HTMLInputElement>;

type TErrorBehaviour = {
  hasError?: boolean;
  errorText?: string;
};


export type TInputProps =
  TTextboxProps &
  TErrorBehaviour & {
    direction?: 'ltr' | 'rtl';
    helperText?: string;
  };
