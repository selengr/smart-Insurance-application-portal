import { ButtonHTMLAttributes } from 'react';

export type TLoadingBehaviour = {
  isLoading?: boolean;
  loadingText?: string;
};


export type TButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  TLoadingBehaviour & {
    icon?: React.ReactNode;
    shape?: 'normal' | 'full';
  };
