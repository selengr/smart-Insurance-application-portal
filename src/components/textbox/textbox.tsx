import classNames from 'classnames';
import { forwardRef } from 'react';

import { TTextboxProps } from './textbox.types';

const Textbox = forwardRef<HTMLInputElement, TTextboxProps>(
  ({ type = 'text', className, ...rest }, ref) => {
    const classes = classNames(className);
    return (
      <input
        onWheel={(e) => e.currentTarget.blur()}
        ref={ref}
        type={type}
        className={classes}
        {...rest}
      />
    );
  }
);

Textbox.displayName = 'Textbox';
export default Textbox;
