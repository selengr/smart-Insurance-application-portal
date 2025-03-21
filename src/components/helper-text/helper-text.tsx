import classNames from 'classnames';

import { THelperTextProps } from './helper-text.types';


export const HelperText: React.FC<THelperTextProps> = ({
  status = 'active',
  isDisabled = false,
  text,
  customClassName
}) => {


  const textClass = classNames(
    'helper-text',
    {
      'text-secondary-text': status === 'active' && !isDisabled,
      'text-error': status === 'error' && !isDisabled,
      'text-success': status === 'success' && !isDisabled,
      'text-disabled': isDisabled,
    },
    customClassName 
  );

  return (
    <div className={textClass}>
      <span
        datatype={`${status === 'error' ? 'cy-error-text' : 'cy-info-text'}`}
      >
        {text}
      </span>
    </div>
  );
};
