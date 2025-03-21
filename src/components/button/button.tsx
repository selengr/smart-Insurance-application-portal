import classNames from 'classnames';
import React from 'react';

import { TButtonProps } from './button.types';

import Spinner from '../spinner/spinner';

export const Button: React.FC<TButtonProps> = ({
  icon,
  shape = 'normal',
  isLoading = false,
  disabled = false,
  className,
  children,
  datatype,
  ...restProps
}) => {


  return (
    <button
      className={'inline-flex items-center justify-center gap-x-1.5 bg-primary p-2 px-8 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none'}
      disabled={disabled || isLoading}
      datatype={datatype}
      {...restProps}
    >
      {isLoading ? (
        <span className="loader">
          <Spinner />
        </span>
      ) : (
        <>
          {children}
          {icon && <span className="mr-l">{icon}</span>}{' '}
        </>
      )}
    </button>
  );
};
